import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommandStats extends Document {
    name: string;
    slashCount: number;
    userCount: number;
    guildCount: number;
    commandCount: number;
}

const commandStatsSchema = new Schema<ICommandStats>({
    name: { type: String, default: "command_stats_unoah" },
    slashCount: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
    guildCount: { type: Number, default: 0 },
    commandCount: { type: Number, default: 0 },
});

const CommandStats: Model<ICommandStats> = mongoose.model<ICommandStats>("CommandStats", commandStatsSchema, "commandstats");

export default CommandStats;