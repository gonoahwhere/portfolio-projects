import mongoose, { Schema, Document } from 'mongoose';
import type { CardFile } from '../utils/cards.js';

export type { CardFile as ICardFile };

export interface IPlayer {
    id: string;
    username: string;
}

export interface IGame extends Document {
    id: string;
    guildId: string;
    hostId: string;
    maxPlayers: number;
    messageId: string | null;
    channelId: string | null;
    players: IPlayer[];
    deck: CardFile[];
    hands: Record<string, CardFile[]>;
    handMessageIds: Record<string, { handMsgId: string; gameMsgId: string }>;
    centerCard: CardFile | null;
    theme: string;
    started: boolean;
    currentTurn: string | null;
}

const CardFileSchema = new Schema<CardFile>({
    name: { type: String, required: true },
    path: { type: String, required: true },
}, { _id: false });

const PlayerSchema = new Schema<IPlayer>({
    id: { type: String, required: true },
    username: { type: String, required: true },
}, { _id: false });

const GameSchema = new Schema<IGame>({
    id: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    hostId: { type: String, required: true },
    maxPlayers: { type: Number, required: true },
    messageId: { type: String, default: null },
    channelId: { type: String, default: null },
    players: { type: [PlayerSchema], default: [] },
    deck: { type: [CardFileSchema], default: [] },
    hands: { type: Map, of: [CardFileSchema], default: {} },
    handMessageIds: { type: Map, of: new Schema({ handMsgId: String, gameMsgId: String }, { _id: false }), default: {} },
    centerCard: { type: CardFileSchema, default: null },
    theme: { type: String, default: 'dark' },
    started: { type: Boolean, default: false },
    currentTurn: { type: String, default: null },
});

export default mongoose.model<IGame>('Game', GameSchema);