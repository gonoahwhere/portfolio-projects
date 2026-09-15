import { MessageFlags, ButtonInteraction, AttachmentBuilder } from "discord.js";
import { getLobbyById, saveLobbyToDB } from "../../utils/lobbies.js";
import { buildDeck, pickCenterCard } from "../../utils/cards.js";
import ServerSettings from "../../models/serverSettings.js";
import { renderGameCard, renderHand } from "../../utils/renderGameCard.js";

function getCardsPerPlayer(count: number) {
    if (count === 2) return 11;
    if (count === 3) return 9;
    return 7;
}

export default async function handleStartLobby(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("lobby_start:")) return;
    const lobbyId = interaction.customId.split(":")[1];
    if (!lobbyId) return;
    const lobby = getLobbyById(interaction.guildId!, lobbyId);

    if (!lobby) {
        return interaction.reply({
            content: "No active lobby found.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (interaction.user.id !== lobby.hostId) {
        return interaction.reply({
            content: "Only the host can start the game.",
            flags: MessageFlags.Ephemeral,
        });
    }

    if (lobby.players.length < 2) {
        return interaction.reply({
            content: "At least 2 players are required to start.",
            flags: MessageFlags.Ephemeral,
        });
    }

    await interaction.deferUpdate();

    const settings = await ServerSettings.findOne({ guildId: interaction.guildId }).lean();
    const theme = settings?.theme || "dark";
    let deck = buildDeck(theme);
    deck = deck.sort(() => Math.random() - 0.5);
    const cardsPerPlayer = getCardsPerPlayer(lobby.players.length);

    if (deck.length < lobby.players.length * cardsPerPlayer + 1) {
        const buffer = await renderGameCard(lobby, theme);
        await interaction.message.edit({
            content: "Not enough cards in deck to start game.",
            components: [],
            files: [new AttachmentBuilder(buffer, { name: "game.png" })],
        });
        return;
    }

    const centerCard = pickCenterCard(deck);

    if (!centerCard) {
        return interaction.message.edit({
            content: "Failed to pick center card.",
            components: [],
        });
    }

    lobby.centerCard = centerCard;
    const centerIndex = deck.findIndex(c => c.name === centerCard.name);
    if (centerIndex !== -1) {
        deck.splice(centerIndex, 1);
    }

    const hands = new Map();
    for (const player of lobby.players) {
        hands.set(player.id, deck.splice(0, cardsPerPlayer));
    }

    lobby.hands = hands;
    lobby.deck = deck;
    lobby.started = true;
    lobby.currentTurn = lobby.players[0]!.id;
    lobby.channelId = interaction.channelId;
    
    // Check all players can receive DMs before starting
    const blockedPlayers: string[] = [];
    for (const player of lobby.players) {
        try {
            const user = await interaction.client.users.fetch(player.id);
            await user.createDM();
            await user.send({ content: "✅ DM check — the game is about to start!" }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        } catch {
            blockedPlayers.push(player.id);
        }
    }

    if (blockedPlayers.length > 0) {
        const mentions = blockedPlayers.map(id => `<@${id}>`).join(", ");
        await interaction.message.edit({
            content: `Hey, ${mentions} — you need to open DMs from this server otherwise the game cannot be played!`,
        });
        return;
    }

    lobby.handMessageIds = new Map();
    for (const player of lobby.players) {
        const hand = hands.get(player.id)!;
        if (!hand) continue;

        try {
            const user = await interaction.client.users.fetch(player.id);
            const handBuffer = await renderHand(hand, theme);
            const gameBuffer = await renderGameCard(lobby, theme);
            const dmMessage = await user.send({
                content: `Your hand:`,
                files: [new AttachmentBuilder(handBuffer, { name: "hand.png" })],
            });
            const dmMessage2 = await user.send({
                content: "Game state:",
                files: [new AttachmentBuilder(gameBuffer, { name: "game.png" })],
            });
            lobby.handMessageIds.set(player.id, { handMsgId: dmMessage.id, gameMsgId: dmMessage2.id, });
        } catch (err) {
            console.error("DM failed:", player.id, err);
        }
    }

    await saveLobbyToDB(lobby);

    const buffer = await renderGameCard(lobby, theme);
    await interaction.message.edit({
        content: "Game has started!",
        components: [],
        files: [new AttachmentBuilder(buffer, { name: "game.png" })],
    });

    return true;
}