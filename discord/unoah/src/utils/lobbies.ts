import { Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { CardFile } from "./cards.js";
import Game from '../models/game.js';

const MAIN_SERVER_IDS = new Set(['1412083896300077140']);
const MAX_LOBBIES_MAIN = 150;
const MAX_LOBBIES_DEFAULT = 25;

export type Player = {
    id: string;
    username: string;
};

export type Lobby = {
    id: string;
    guildId: string;
    hostId: string;
    maxPlayers: number;
    messageId: string | null;
    channelId?: string | null;
    players: Player[];
    deck?: CardFile[];
    hands?: Map<string, CardFile[]>;
    handMessageIds?: Map<string, { handMsgId: string; gameMsgId: string }>;
    centerCard?: CardFile;
    theme?: string;
    started?: boolean;
    currentTurn?: string | null;
};

const activeLobbies = new Collection<string, Lobby[]>();
const userLobbyMap = new Collection<string, string>();

// Limits
export function getMaxLobbies(guildId: string): number {
    return MAIN_SERVER_IDS.has(guildId) ? MAX_LOBBIES_MAIN : MAX_LOBBIES_DEFAULT;
}

// Getters
export function getGuildLobbies(guildId: string): Lobby[] {
    if (!activeLobbies.has(guildId)) {
        activeLobbies.set(guildId, []);
    }
    
    return activeLobbies.get(guildId)!;
}

export function getLobbyById(guildId: string, lobbyId: string): Lobby | null {
    return getGuildLobbies(guildId).find(l => l.id === lobbyId) ?? null;
}

export function getLobbyByMessageId(guildId: string, messageId: string): Lobby | null {
    return getGuildLobbies(guildId).find(l => l.messageId === messageId) ?? null;
}

// Create Lobby (uncommitted)
export async function createLobby(guildId: string, hostId: string, hostUsername: string, maxPlayers: number) {
    const lobbies = getGuildLobbies(guildId);
    const max = getMaxLobbies(guildId);

    if (lobbies.length >= max) {
        return { error: `This server has reached its lobby limit (${max}).` };
    }

    if (userLobbyMap.has(hostId)) {
        const existingLobbyId = userLobbyMap.get(hostId)!;
        const existsInDb = await Game.exists({ id: existingLobbyId });
        if (existsInDb) {
            return { error: 'You are already in an active lobby.' };
        }
        // Stale entry — clean it up
        userLobbyMap.delete(hostId);
        for (const [guildId, lobbies] of activeLobbies) {
            const idx = lobbies.findIndex(l => l.id === existingLobbyId);
            if (idx !== -1) lobbies.splice(idx, 1);
        }
    }

    const lobby: Lobby = {
        id: `${guildId}-${hostId}-${Date.now()}`,
        guildId,
        hostId,
        maxPlayers,
        messageId: null,
        channelId: null,
        players: [{ id: hostId, username: hostUsername }],
    };

    return { lobby };
}

// Commit to memory + DB
export async function commitLobby(lobby: Lobby): Promise<void> {
    const lobbies = getGuildLobbies(lobby.guildId);
    lobbies.push(lobby);
    userLobbyMap.set(lobby.hostId, lobby.id);
    await saveLobbyToDB(lobby);
}

// Delete from memory + DB
export async function deleteLobby(guildId: string, lobbyId: string): Promise<void> {
    const lobbies = getGuildLobbies(guildId);
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    for (const player of lobby.players) {
        userLobbyMap.delete(player.id);
    }

    const index = lobbies.indexOf(lobby);
    if (index !== -1) lobbies.splice(index, 1);

    await Game.deleteOne({ id: lobbyId });
}

// Save or update a lobby in the DB
export async function saveLobbyToDB(lobby: Lobby): Promise<void> {
    const handsObj: Record<string, CardFile[]> = {};
    if (lobby.hands) {
        for (const [playerId, cards] of lobby.hands.entries()) {
            handsObj[playerId] = cards;
        }
    }

    const handMessageIdsObj: Record<string, { handMsgId: string; gameMsgId: string }> = {};
    if (lobby.handMessageIds) {
        for (const [playerId, msgIds] of lobby.handMessageIds.entries()) {
            handMessageIdsObj[playerId] = msgIds;
        }
    }

    await Game.findOneAndUpdate(
        { id: lobby.id },
        {
            id: lobby.id,
            guildId: lobby.guildId,
            hostId: lobby.hostId,
            maxPlayers: lobby.maxPlayers,
            messageId: lobby.messageId,
            channelId: lobby.channelId ?? null,
            players: lobby.players,
            deck: lobby.deck ?? [],
            hands: handsObj,
            handMessageIds: handMessageIdsObj,
            centerCard: lobby.centerCard ?? null,
            theme: lobby.theme ?? 'dark',
            started: lobby.started ?? false,
            currentTurn: lobby.currentTurn ?? null,
        },
        { upsert: true, returnDocument: 'after' }
    );
}

// Restore all lobbies from DB into memory on startup
export async function restoreLobbiesFromDB(): Promise<void> {
    const games = await Game.find({});
    console.log(`[Lobbies] Restoring ${games.length} games from DB...`);

    for (const game of games) {
        const hands = new Map<string, CardFile[]>();
        if (game.hands) {
            const rawHands = game.hands instanceof Map ? game.hands : new Map(Object.entries(game.hands));
            for (const [playerId, cards] of rawHands.entries()) {
                hands.set(playerId, cards as CardFile[]);
            }
        }

        const handMessageIds = new Map<string, { handMsgId: string; gameMsgId: string }>();
        if (game.handMessageIds) {
            const raw = game.handMessageIds instanceof Map ? game.handMessageIds : new Map(Object.entries(game.handMessageIds));
            for (const [playerId, msgIds] of raw.entries()) {
                handMessageIds.set(playerId, msgIds as { handMsgId: string; gameMsgId: string });
            }
        }

        const lobby: Lobby = {
            id: game.id,
            guildId: game.guildId,
            hostId: game.hostId,
            maxPlayers: game.maxPlayers,
            messageId: game.messageId,
            channelId: game.channelId ?? null,
            players: game.players,
            deck: game.deck,
            hands,
            handMessageIds,
            theme: game.theme,
            started: game.started,
            currentTurn: game.currentTurn ?? null,
            ...(game.centerCard ? { centerCard: game.centerCard } : {}),
        };

        const lobbies = getGuildLobbies(game.guildId);
        lobbies.push(lobby);

        for (const player of lobby.players) {
            userLobbyMap.set(player.id, lobby.id);
        }
    }

    console.log(`[Lobbies] Restore complete.`);
}

// Buttons
export function buildLobbyButtons(lobby: Lobby) {
    const isFull = lobby.players.length >= lobby.maxPlayers;
    const hasEnough = lobby.players.length >= 2;

    const joinBtn = new ButtonBuilder()
        .setCustomId(`lobby_join:${lobby.id}`)
        .setLabel('Join')
        .setStyle(ButtonStyle.Success)
        .setDisabled(isFull);

    const leaveBtn = new ButtonBuilder()
        .setCustomId(`lobby_leave:${lobby.id}`)
        .setLabel('Leave')
        .setStyle(ButtonStyle.Secondary);

    const startBtn = new ButtonBuilder()
        .setCustomId(`lobby_start:${lobby.id}`)
        .setLabel('Start Game')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!hasEnough);

    const closeBtn = new ButtonBuilder()
        .setCustomId(`lobby_close:${lobby.id}`)
        .setLabel('Close Lobby')
        .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(joinBtn, leaveBtn, startBtn, closeBtn);
}

export { activeLobbies, userLobbyMap };