export interface LeaderboardUser {
    userId: string;
    username: string;
    wins: number;
    avatarUrl?: string;
}

export interface LeaderboardGuild {
    guildId: string;
    guildName: string;
    totalWins: number;
    iconUrl?: string;
}