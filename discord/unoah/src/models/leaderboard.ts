import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildUserStats extends Document {
    guildId: string;
    userId: string;
    username: string;
    wins: number;
    avatar?: string;
}

const GuildUserStatsSchema = new Schema<IGuildUserStats>({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    wins: { type: Number, default: 0 },
    avatar: { type: String },
});

GuildUserStatsSchema.index({ guildId: 1, userId: 1 }, { unique: true });
GuildUserStatsSchema.index({ guildId: 1, wins: -1 });

export const GuildUserStats = mongoose.model<IGuildUserStats>('GuildUserStats', GuildUserStatsSchema);