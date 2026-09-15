import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildInfo extends Document {
    guildId: string;
    guildName: string;
    ownerId?: string;
    ownerTag?: string;
    icon?: string;
    banner?: string;
    memberCount: number;
    completedGames: number;
}

const GuildInfoSchema = new Schema<IGuildInfo>({
    guildId: { type: String, required: true, unique: true, index: true },
    guildName: { type: String, default: 'Unknown' },
    ownerId: { type: String },
    ownerTag: { type: String },
    icon: { type: String },
    banner: { type: String },
    memberCount: { type: Number, default: 0 },
    completedGames: { type: Number, default: 0, index: true },
});

export const GuildInfo = mongoose.model<IGuildInfo>('GuildInfo', GuildInfoSchema);
export default GuildInfo;