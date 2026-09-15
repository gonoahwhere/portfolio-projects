import { Events, Message, AttachmentBuilder, TextChannel } from "discord.js";
import type { BotClient } from "../../types/Client.js";
import { userLobbyMap, activeLobbies, saveLobbyToDB, deleteLobby, type Lobby } from "../../utils/lobbies.js";
import { renderHand, renderGameCard } from "../../utils/renderGameCard.js";
import { renderGameEnd } from "../../utils/renderGameEnd.js";
import { GuildUserStats } from '../../models/leaderboard.js';
import GuildInfo from "../../models/guildInfo.js";

const COLOR_MAP: Record<string, string> = {
    green:  "G",
    orange: "O",
    pink:   "P",
    blue:   "B",
};

const REVERSE_COLOR_MAP: Record<string, string> = {
    G: "green",
    O: "orange",
    P: "pink",
    B: "blue",
};

const unoahCalled = new Set<string>();

function parseCardInput(input: string): { cardFilename: string; chosenColor?: string } | null {
    const parts = input.trim().toLowerCase().split(/\s+/);
    
    if (parts[0] === "pickup" || (parts[0] === "pick" && parts[1] === "up")) {
        return { cardFilename: "PICKUP" };
    }

    if ((parts[0] === "draw" && parts[1] === "2") || parts[0] === "d2") {
        const colorKey = parts[0] === "draw" ? parts[2] : parts[1];
        if (!colorKey || !COLOR_MAP[colorKey]) return null;
        return {
            cardFilename: `DRAW2_${COLOR_MAP[colorKey]}.png`,
        };
    }

    // e.g. "green draw 2" or "green d2"
    if (COLOR_MAP[parts[0] ?? ""] && ((parts[1] === "draw" && parts[2] === "2") || parts[1] === "d2")) {
        const colorKey = parts[0]!;
        return {
            cardFilename: `DRAW2_${COLOR_MAP[colorKey]}.png`,
        };
    }

    if ((parts[0] === "draw" && parts[1] === "4") || parts[0] === "d4") {
        const colorKey = parts[0] === "draw" ? parts[2] : parts[1];
        if (!colorKey || !COLOR_MAP[colorKey]) return null;
        return {
            cardFilename: "DRAW4.png",
            chosenColor: colorKey,
        };
    }

    // e.g. "green draw 4" or "green d4"
    if (COLOR_MAP[parts[0] ?? ""] && ((parts[1] === "draw" && parts[2] === "4") || parts[1] === "d4")) {
        const colorKey = parts[0]!;
        return {
            cardFilename: "DRAW4.png",
            chosenColor: colorKey,
        };
    }

    if (parts[0] === "wild") {
        const colorKey = parts[1];
        if (!colorKey || !COLOR_MAP[colorKey]) return null;
        return {
            cardFilename: "WILD.png",
            chosenColor: colorKey,
        };
    }

    if (parts.length !== 2) return null;

    let colorKey: string | undefined;
    let valueKey: string | undefined;

    for (const part of parts) {
        if (COLOR_MAP[part]) colorKey = part;
        else valueKey = part;
    }

    if (!colorKey || !valueKey) return null;

    const colorLetter = COLOR_MAP[colorKey];

    if (/^\d$/.test(valueKey)) {
        return {
            cardFilename: `${valueKey}${colorLetter}.png`,
        };
    }

    if (valueKey === "skip" || valueKey === "reverse" || valueKey === "draw2") {
        return {
            cardFilename: `${valueKey.toUpperCase()}_${colorLetter}.png`,
        };
    }

    return null;
}

interface CardProperties {
    color: string;
    value: string;
}

function parseCardFilename(filename: string): CardProperties | null {
    const name = filename.replace(".png", "");
    
    const actionMatch = name.match(/^(SKIP|REVERSE|DRAW2)_([A-Z])$/);
    if (actionMatch && actionMatch[1] && actionMatch[2]) {
        return {
            value: actionMatch[1],
            color: REVERSE_COLOR_MAP[actionMatch[2]] || "",
        };
    }
    
    const numberMatch = name.match(/^(\d)([A-Z])$/);
    if (numberMatch && numberMatch[1] && numberMatch[2]) {
        return {
            value: numberMatch[1],
            color: REVERSE_COLOR_MAP[numberMatch[2]] || "",
        };
    }
    
    return null;
}

function canPlayCard(playedCard: CardProperties, centerCard: CardProperties): boolean {
    return playedCard.color === centerCard.color || playedCard.value === centerCard.value;
}

function isWildCard(cardFilename: string): boolean {
    const name = cardFilename.toLowerCase().replace(".png", "");
    return name === "wild" || name === "draw4";
}

function getDrawAmount(cardName: string): number {
    const upper = cardName.toUpperCase();
    if (upper.includes("DRAW4")) return 4;
    if (upper.includes("DRAW2")) return 2;
    return 0;
}

function advanceTurn(lobby: Lobby, skipCount: number = 1): void {
    if (!lobby.currentTurn || lobby.players.length === 0) return;

    const idx = lobby.players.findIndex(p => p.id === lobby.currentTurn);
    let nextIdx = idx;
    
    for (let i = 0; i < skipCount; i++) {
        nextIdx = (nextIdx + 1) % lobby.players.length;
    }
    
    lobby.currentTurn = lobby.players[nextIdx]!.id;
}

function processCardEffect(lobby: Lobby, cardName: string): number {
    const upper = cardName.toUpperCase();
    
    if (upper.includes("SKIP")) {
        return 2;
    }
    
    if (upper.includes("REVERSE")) {
        if (lobby.players.length === 2) {
            return 2;
        } else {
            const currentIdx = lobby.players.findIndex(p => p.id === lobby.currentTurn);
            lobby.players.reverse();
            const newIdx = lobby.players.findIndex(p => p.id === lobby.currentTurn);
            const diff = currentIdx - newIdx;
            lobby.currentTurn = lobby.players[(newIdx + diff) % lobby.players.length]!.id;
            return 1;
        }
    }
    
    if (upper.includes("DRAW")) {
        return 2;
    }
    
    return 1;
}

function findLobbyForPlayer(playerId: string) {
    const lobbyId = userLobbyMap.get(playerId);
    if (!lobbyId) return null;

    for (const [, lobbies] of activeLobbies) {
        const lobby = lobbies.find(l => l.id === lobbyId);
        if (lobby) return lobby;
    }

    return null;
}

function formatCardName(filename: string, chosenColor?: string): string {
    const name = filename.replace('.png', '');

    if (name === 'WILD') return chosenColor ? `wild (${chosenColor})` : 'wild';
    if (name === 'DRAW4') return chosenColor ? `draw 4 (${chosenColor})` : 'draw 4';

    const actionMatch = name.match(/^(SKIP|REVERSE|DRAW2)_([A-Z])$/);
    if (actionMatch) {
        const [, value, colorLetter] = actionMatch as [string, string, string];
        const color = REVERSE_COLOR_MAP[colorLetter] ?? colorLetter;
        return `${color} ${value.toLowerCase().replace('draw2', 'draw 2')}`;
    }

    const numberMatch = name.match(/^(\d)([A-Z])$/);
    if (numberMatch) {
        const [, num, colorLetter] = numberMatch as [string, string, string];
        const color = REVERSE_COLOR_MAP[colorLetter] ?? colorLetter;
        return `${color} ${num}`;
    }

    return name;
}

async function notifyNextPlayer(bot: BotClient, lobby: Lobby, actingUsername: string, cardName: string, context: 'played' | 'pickup' | 'penalty', theme: string): Promise<void> {
    const nextPlayer = lobby.players.find(p => p.id === lobby.currentTurn);
    if (!nextPlayer) return;

    try {
        const nextUser = await bot.users.fetch(nextPlayer.id);
        const nextDm = await nextUser.createDM();

        const nextHand = lobby.hands?.get(nextPlayer.id) ?? [];
        const nextMessageIds = lobby.handMessageIds?.get(nextPlayer.id);
        if (nextMessageIds) {
            try {
                const nextHandBuffer = await renderHand(nextHand, theme);
                const nextHandAttachment = new AttachmentBuilder(nextHandBuffer, { name: "hand.png" });
                const nextHandMessage = await nextDm.messages.fetch(nextMessageIds.handMsgId);
                await nextHandMessage.edit({ files: [nextHandAttachment] });

                const nextGameBuffer = await renderGameCard(lobby, theme);
                const nextGameAttachment = new AttachmentBuilder(nextGameBuffer, { name: "game.png" });
                const nextGameMessage = await nextDm.messages.fetch(nextMessageIds.gameMsgId);
                await nextGameMessage.edit({ files: [nextGameAttachment] });
            } catch {
                // Edit failed — they'll see it on their next play
            }
        }

        let turnMsg: string;
        if (context === 'pickup') {
            turnMsg = `It's your turn! **${actingUsername}** picked up a card.\nPlay a card by typing e.g. \`draw 4 orange\`, \`pink 3\` or \`pick up\`.`;
        } else if (context === 'penalty') {
            turnMsg = `It's your turn! **${actingUsername}** forgot to say UNOAH and lost their turn.\nPlay a card by typing e.g. \`draw 4 orange\`, \`pink 3\` or \`pick up\`.`;
        } else {
            turnMsg = `It's your turn! **${actingUsername}** just played **${cardName}**.\nPlay a card by typing e.g. \`draw 4 orange\`, \`pink 3\` or \`pick up\`.`;
        }

        if (nextHand.length === 1) {
            turnMsg += `\nYou only have **1 card left** — remember to type \`unoah <card>\` when you play it, e.g. \`unoah pink 3\`!`;
        }

        await nextDm.send({ content: turnMsg }).then(msg => {
            setTimeout(() => { msg.delete().catch(() => {}); }, 10000);
        });
    } catch {
        console.log("Failed to notify next player.");
    }
}

export default {
    name: Events.MessageCreate,
    once: false,

    async execute(message: Message, bot: BotClient) {
        if (message.author.bot) return;
        if (message.guild) return;

        const playerId = message.author.id;
        const input = message.content.trim();
        const lobby = findLobbyForPlayer(playerId);

        if (!lobby || !lobby.started) {
            await message.reply("You are not currently in an active game.");
            return;
        }

        if (lobby.currentTurn !== playerId) {
            const currentPlayer = lobby.players.find(p => p.id === lobby.currentTurn);
            const errorMsg = await message.reply(`It's not your turn. It is currently **${currentPlayer?.username ?? "someone else"}**'s turn.`);
            setTimeout(() => errorMsg.delete().catch(() => {}), 10000);
            return;
        }

        const inputLower = input.toLowerCase();
        const hasUnoah = inputLower.startsWith('unoah ');
        const cardInput = hasUnoah ? input.slice(6).trim() : input;

        if (hasUnoah) {
            unoahCalled.add(playerId);
        }

        const playInput = parseCardInput(cardInput);
        if (!playInput) return;

        const cardFilename = playInput.cardFilename;
        const chosenColor = playInput.chosenColor;
        const theme = lobby.theme ?? "dark";

        if (cardFilename === "PICKUP") {
            const hand = lobby.hands?.get(playerId) ?? [];
            
            if (!lobby.deck || lobby.deck.length === 0) {
                await message.reply("No cards left in the deck!");
                return;
            }

            const drawnCard = lobby.deck.pop();
            if (drawnCard) {
                hand.push(drawnCard);
                lobby.hands?.set(playerId, hand);
            }

            unoahCalled.delete(playerId);
            advanceTurn(lobby);
            await saveLobbyToDB(lobby);

            const handBuffer = await renderHand(hand, theme);
            const handAttachment = new AttachmentBuilder(handBuffer, { name: "hand.png" });
            const messageIds = lobby.handMessageIds?.get(playerId);

            if (messageIds) {
                try {
                    const dmChannel = await message.author.createDM();
                    const handMessage = await dmChannel.messages.fetch(messageIds.handMsgId);
                    await handMessage.edit({ content: `Picked up a card. Here's your updated hand:`, files: [handAttachment] });

                    const gameBuffer = await renderGameCard(lobby, theme);
                    const gameAttachment = new AttachmentBuilder(gameBuffer, { name: "game.png" });
                    const gameMessage = await dmChannel.messages.fetch(messageIds.gameMsgId);
                    await gameMessage.edit({ files: [gameAttachment] });
                } catch {
                    await message.reply({ content: `Picked up a card. Here's your updated hand:`, files: [handAttachment] });
                }
            } else {
                await message.reply({ content: `Picked up a card. Here's your updated hand:`, files: [handAttachment] });
            }

            await notifyNextPlayer(bot, lobby, message.author.username, '', 'pickup', theme);
            return;
        }

        const hand = lobby.hands?.get(playerId) ?? [];
        const cardIndex = hand.findIndex(c => c.name.toLowerCase() === cardFilename.toLowerCase());

        if (cardIndex === -1) {
            const errorMsg = await message.reply(`You don't have **${formatCardName(cardFilename, chosenColor)}** in your hand. Check your cards and try again.`);
            setTimeout(() => errorMsg.delete().catch(() => {}), 10000);
            return;
        }

        if (hand.length === 1 && !unoahCalled.has(playerId)) {
            for (let i = 0; i < 2; i++) {
                if (lobby.deck && lobby.deck.length > 0) {
                    const card = lobby.deck.pop();
                    if (card) hand.push(card);
                }
            }
            lobby.hands?.set(playerId, hand);
            advanceTurn(lobby);
            await saveLobbyToDB(lobby);

            const handBuffer = await renderHand(hand, theme);
            const handAttachment = new AttachmentBuilder(handBuffer, { name: "hand.png" });
            const messageIds = lobby.handMessageIds?.get(playerId);

            const penaltyMsg = `You forgot to say **UNOAH** before playing your last card! You've been given 2 penalty cards and your turn has been skipped.\nNext time type \`unoah <card>\`, e.g. \`unoah pink 3\`.`;

            if (messageIds) {
                try {
                    const dmChannel = await message.author.createDM();
                    const handMessage = await dmChannel.messages.fetch(messageIds.handMsgId);
                    await handMessage.edit({ files: [handAttachment] });
                    await message.reply({ content: penaltyMsg });

                    const gameBuffer = await renderGameCard(lobby, theme);
                    const gameAttachment = new AttachmentBuilder(gameBuffer, { name: "game.png" });
                    const gameMessage = await dmChannel.messages.fetch(messageIds.gameMsgId);
                    await gameMessage.edit({ files: [gameAttachment] });
                } catch {
                    await message.reply({ content: penaltyMsg, files: [handAttachment] });
                }
            } else {
                await message.reply({ content: penaltyMsg, files: [handAttachment] });
            }

            await notifyNextPlayer(bot, lobby, message.author.username, '', 'penalty', theme);
            return;
        }

        const isWild = isWildCard(cardFilename);

        if (isWild && !chosenColor) {
            const errorMsg = await message.reply(`You must specify a color for that card!\nUse \`wild green\`, \`wild blue\`, \`wild pink\`, or \`wild orange\`.`);
            setTimeout(() => { errorMsg.delete().catch(() => {}); }, 10000);
            return;
        }

        if (lobby.centerCard && !isWild) {
            const playedCardProps = parseCardFilename(cardFilename);
            const centerCardName = lobby.centerCard.name.toLowerCase().replace('.png', '');
            const centerIsWild = centerCardName === 'wild' || centerCardName === 'draw4';

            if (centerIsWild) {
                const activeColor = (lobby.centerCard as any).chosenColor as string | undefined;
                if (activeColor && playedCardProps && playedCardProps.color !== activeColor) {
                    const errorMsg = await message.reply(`You can't play that card! The active color is **${activeColor}**.\nPlay a **${activeColor}** card or a wild.`);
                    setTimeout(() => { errorMsg.delete().catch(() => {}); }, 10000);
                    return;
                }
            } else {
                const centerCardProps = parseCardFilename(lobby.centerCard.name);

                if (!playedCardProps || !centerCardProps) {
                    const errorMsg = await message.reply('There was an error validating the card. Please try again.');
                    setTimeout(() => { errorMsg.delete().catch(() => {}); }, 10000);
                    return;
                }

                if (!canPlayCard(playedCardProps, centerCardProps)) {
                    const errorMsg = await message.reply(
                        `You can't play that card! The discard pile shows a **${centerCardProps.color} ${centerCardProps.value}**.\n` +
                        `You can only play a card that matches the **color** (${centerCardProps.color}) or **value** (${centerCardProps.value}).`
                    );
                    setTimeout(() => { errorMsg.delete().catch(() => {}); }, 10000);
                    return;
                }
            }
        }

        const playedCard = hand.splice(cardIndex, 1)[0];
        if (!playedCard) return;

        if (isWild && chosenColor) {
            (playedCard as any).chosenColor = chosenColor;
        }

        lobby.centerCard = playedCard;
        lobby.hands!.set(playerId, hand);
        unoahCalled.delete(playerId);

        const drawAmount = getDrawAmount(playedCard.name);
        const currentIdx = lobby.players.findIndex(p => p.id === lobby.currentTurn);
        const nextIdx = (currentIdx + 1) % lobby.players.length;
        const nextPlayerForDraw = lobby.players[nextIdx];

        if (drawAmount > 0 && nextPlayerForDraw) {
            const nextHand = lobby.hands?.get(nextPlayerForDraw.id) ?? [];
            for (let i = 0; i < drawAmount; i++) {
                if (lobby.deck && lobby.deck.length > 0) {
                    const card = lobby.deck.pop();
                    if (card) nextHand.push(card);
                }
            }
            lobby.hands?.set(nextPlayerForDraw.id, nextHand);
        }

        const skipAmount = processCardEffect(lobby, playedCard.name);
        advanceTurn(lobby, skipAmount);
        await saveLobbyToDB(lobby);

        const cardName = formatCardName(playedCard.name, isWild && chosenColor ? chosenColor : undefined);

        if (hand.length === 0) {
            const messageIds = lobby.handMessageIds?.get(playerId);
            if (messageIds) {
                try {
                    const dmChannel = await message.author.createDM();
                    const handMessage = await dmChannel.messages.fetch(messageIds.handMsgId);
                    await handMessage.delete();

                    const endBuffer = await renderGameEnd(message.author.username);
                    const gameMessage = await dmChannel.messages.fetch(messageIds.gameMsgId);
                    await gameMessage.edit({ content: "Game over!", files: [new AttachmentBuilder(endBuffer, { name: "game.png" })] });
                } catch { /* already gone */ }
            }

            if (lobby.channelId && lobby.messageId) {
                try {
                    const guild = await bot.guilds.fetch(lobby.guildId);
                    const channel = await guild.channels.fetch(lobby.channelId);
                    if (channel && channel.isTextBased()) {
                        const boardMessage = await (channel as TextChannel).messages.fetch(lobby.messageId);
                        const endBuffer = await renderGameEnd(message.author.username);
                        await boardMessage.edit({ content: "Game over!", files: [new AttachmentBuilder(endBuffer, { name: "game.png" })] });
                    }
                } catch (e) {
                    console.error("Failed to update board message on game end:", e);
                }
            }

            await Promise.all([
                GuildUserStats.findOneAndUpdate(
                    {
                        guildId: lobby.guildId,
                        userId: playerId,
                    },
                    {
                        $inc: { wins: 1 },
                        $set: {
                            username: message.author.username,
                            avatar: message.author.avatar,
                        },
                    },
                    {
                        upsert: true,
                    }
                ),

                GuildInfo.findOneAndUpdate(
                    { guildId: lobby.guildId },
                    { $inc: { completedGames: 1 } },
                    { upsert: true }
                ),
            ]);

            await message.reply(`Played **${cardName}**. You have no cards left — you win! 🎉`);
            await deleteLobby(lobby.guildId, lobby.id);
            return;
        }

        const handBuffer = await renderHand(hand, theme);
        const handAttachment = new AttachmentBuilder(handBuffer, { name: "hand.png" });
        const messageIds = lobby.handMessageIds?.get(playerId);

        if (messageIds) {
            try {
                const dmChannel = await message.author.createDM();
                const handMessage = await dmChannel.messages.fetch(messageIds.handMsgId);
                await handMessage.edit({ content: `Played **${cardName}**. Here's your updated hand:`, files: [handAttachment] });

                const gameBuffer = await renderGameCard(lobby, theme);
                const gameAttachment = new AttachmentBuilder(gameBuffer, { name: "game.png" });
                const gameMessage = await dmChannel.messages.fetch(messageIds.gameMsgId);
                await gameMessage.edit({ files: [gameAttachment] });
            } catch {
                await message.reply({ content: `Played **${cardName}**. Here's your updated hand:`, files: [handAttachment] });
            }
        } else {
            await message.reply({ content: `Played **${cardName}**. Here's your updated hand:`, files: [handAttachment] });
        }

        if (lobby.channelId && lobby.messageId) {
            try {
                const guild = await bot.guilds.fetch(lobby.guildId);
                const channel = await guild.channels.fetch(lobby.channelId);
                if (channel && channel.isTextBased()) {
                    const boardMessage = await (channel as TextChannel).messages.fetch(lobby.messageId);
                    const boardBuffer = await renderGameCard(lobby, theme);
                    await boardMessage.edit({ content: "Game in progress!", files: [new AttachmentBuilder(boardBuffer, { name: "game.png" })] });
                }
            } catch (e) {
                console.error("Failed to update board message:", e);
            }
        }

        if (drawAmount > 0 && nextPlayerForDraw) {
            try {
                const penalisedUser = await bot.users.fetch(nextPlayerForDraw.id);
                const penalisedDm = await penalisedUser.createDM();
                const penalisedHand = lobby.hands?.get(nextPlayerForDraw.id) ?? [];
                const penalisedHandBuffer = await renderHand(penalisedHand, theme);
                const penalisedHandAttachment = new AttachmentBuilder(penalisedHandBuffer, { name: "hand.png" });
                const penalisedHandMessageId = lobby.handMessageIds?.get(nextPlayerForDraw.id);

                if (penalisedHandMessageId) {
                    try {
                        const penalisedHandMessage = await penalisedDm.messages.fetch(penalisedHandMessageId.handMsgId);
                        await penalisedHandMessage.edit({ files: [penalisedHandAttachment] });

                        const penalisedGameBuffer = await renderGameCard(lobby, theme);
                        const penalisedGameAttachment = new AttachmentBuilder(penalisedGameBuffer, { name: "game.png" });
                        const penalisedGameMessage = await penalisedDm.messages.fetch(penalisedHandMessageId.gameMsgId);
                        await penalisedGameMessage.edit({ files: [penalisedGameAttachment] });
                    } catch {
                        // Edit failed — they'll see updated hand on their next turn
                    }
                }
            } catch {
                console.log("Failed to update penalised player's hand.");
            }
        }

        await notifyNextPlayer(bot, lobby, message.author.username, cardName, 'played', theme);
    },
};