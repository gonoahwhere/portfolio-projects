import { createCanvas, GlobalFonts, Image, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs';
import type { LeaderboardUser, LeaderboardGuild } from '../types/leaderboard.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Bold.ttf'), 'RubikBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Regular.ttf'), 'Rubik');

const RANK_IMAGES: { [key: number]: Image } = {};
const MEDAL_IMAGES: { [key: string]: Image } = {};

function loadRankImages() {
    const rankDir = path.join(process.cwd(), 'dist/assets/images/leaderboard');

    for (let i = 4; i <= 10; i++) {
        const paddedNum = String(i).padStart(2, '0');
        const imagePath = path.join(rankDir, `${paddedNum}.png`);

        if (fs.existsSync(imagePath)) {
            try {
                const img = new Image();
                img.src = fs.readFileSync(imagePath);
                RANK_IMAGES[i] = img;
            } catch (error) {
                console.error(`Failed to load rank image ${paddedNum}.png:`, error);
            }
        }
    }

    const medals = ['gold', 'silver', 'bronze'];
    medals.forEach((medal) => {
        const imagePath = path.join(rankDir, `${medal}.png`);

        if (fs.existsSync(imagePath)) {
            try {
                const img = new Image();
                img.src = fs.readFileSync(imagePath);
                MEDAL_IMAGES[medal] = img;
            } catch (error) {
                console.error(`Failed to load medal image ${medal}.png:`, error);
            }
        }
    });

    console.log(`Loaded ${Object.keys(RANK_IMAGES).length} rank images and ${Object.keys(MEDAL_IMAGES).length} medal images`);
}

const COLORS = {
    bgTop: '#040814',
    bgBottom: '#0A1022',
    cyan: '#00D4FF',
    cyanSoft: '#6EE7FF',
    text: '#F4F8FF',
    muted: '#7E8CA8',
    green: '#00FFB2',
    red: '#FF5C7A',
    yellow: '#FFD700',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
};

function normaliseCdnUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    try {
        const u = new URL(url);
        u.pathname = u.pathname.replace(/\.(gif|webp|jpg|jpeg)$/i, '.png');
        u.searchParams.set('size', '512');
        return u.toString();
    } catch {
        return url;
    }
}

async function fetchImageBuffer(url: string | undefined): Promise<Buffer | null> {
    const normalisedUrl = normaliseCdnUrl(url);
    if (!normalisedUrl) return null;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(normalisedUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return buffer;
    } catch (error) {
        console.error(`fetchImageBuffer: error`, error);
        return null;
    }
}

async function drawCircularImage(ctx: any, imageBuffer: Buffer | null, x: number, y: number, radius: number) {
    if (!imageBuffer) return;
    try {
        const img = await loadImage(imageBuffer);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.beginPath();
        ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
    } catch (error) {
        console.error('Failed to draw circular image', error);
    }
}

function drawRankBadge(ctx: any, rank: number, x: number, y: number, badgeSize: number = 60) {
    let badgeImage: Image | undefined;

    if (rank === 1 && MEDAL_IMAGES['gold']) {
        badgeImage = MEDAL_IMAGES['gold'];
    } else if (rank === 2 && MEDAL_IMAGES['silver']) {
        badgeImage = MEDAL_IMAGES['silver'];
    } else if (rank === 3 && MEDAL_IMAGES['bronze']) {
        badgeImage = MEDAL_IMAGES['bronze'];
    } else if (rank >= 4 && rank <= 10 && RANK_IMAGES[rank]) {
        badgeImage = RANK_IMAGES[rank];
    }

    if (badgeImage) {
        try {
            ctx.drawImage(badgeImage, x - badgeSize / 2, y - badgeSize / 2, badgeSize, badgeSize);
        } catch (error) {
            console.error(`Failed to draw rank badge for rank ${rank}:`, error);
            drawRankBadgeFallback(ctx, rank, x, y);
        }
    } else {
        drawRankBadgeFallback(ctx, rank, x, y);
    }
}

function drawRankBadgeFallback(ctx: any, rank: number, x: number, y: number) {
    const size = 40;
    const colors = {
        1: { bg: COLORS.gold, glow: 'rgba(255,215,0,0.4)' },
        2: { bg: COLORS.silver, glow: 'rgba(192,192,192,0.3)' },
        3: { bg: COLORS.bronze, glow: 'rgba(205,127,50,0.3)' },
    };

    const rankColor = colors[rank as keyof typeof colors] || { bg: COLORS.cyan, glow: 'rgba(0,212,255,0.3)' };

    drawGlow(ctx, x, y, size + 15, rankColor.glow);

    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = rankColor.bg;
    ctx.fill();

    ctx.font = 'bold 22px RubikBold';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${rank}`, x, y);
}

function drawGlow(ctx: any, x: number, y: number, radius: number, color: string) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function roundedRect(ctx: any, x: number, y: number, w: number, h: number, r: number, fill: string) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

loadRankImages();

export async function renderGuildLeaderboard(guildName: string, guildId: string, users: LeaderboardUser[]): Promise<Buffer> {
    const scale = 2
    const width = 900;
    const padX = 40;
    const innerX = padX + 35;
    const rowW = width - (padX + 35) * 2;
    const rowH = 100;
    const rowGap = 12;
    const headerH = 200;
    const numRows = Math.min(users.length, 10);
    const height = headerH + numRows * (rowH + rowGap) - rowGap + 55;

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fill();
    }

    drawGlow(ctx, 100, 100, 200, 'rgba(0,212,255,0.15)');
    drawGlow(ctx, width - 80, height - 80, 240, 'rgba(59,130,246,0.10)');

    roundedRect(ctx, padX, padX, width - padX * 2, height - padX * 2, 28, 'rgba(13,19,36,0.92)');
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '64px RubikBold';
    const titleGrad = ctx.createLinearGradient(60, 60, 380, 60);
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGrad;
    ctx.fillText('GUILD', 70, 118);

    ctx.font = '24px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('USER LEADERBOARD', 74, 152);

    ctx.font = '15px RubikBold';
    const nameW = ctx.measureText(guildName).width;
    ctx.font = '13px Rubik';
    const idLine = `ID: ${guildId}`;
    const idW = ctx.measureText(idLine).width;

    const badgePadX = 14;
    const badgeW = Math.max(nameW, idW) + badgePadX * 2;
    const badgeH = 50;
    const badgeX = width - padX - badgeW - 20;
    const badgeY = 68;

    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 12, 'rgba(0,212,255,0.07)');
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.stroke();

    const line1Size = 15;
    const line2Size = 13;
    const lineGap = 6;
    const blockH = line1Size + lineGap + line2Size;
    const blockTop = badgeY + (badgeH - blockH) / 2;

    ctx.font = `${line1Size}px RubikBold`;
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.fillText(guildName, badgeX + badgePadX, blockTop + line1Size);

    ctx.font = `${line2Size}px Rubik`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(idLine, badgeX + badgePadX, blockTop + line1Size + lineGap + line2Size);

    const divGrad = ctx.createLinearGradient(70, 0, width - 70, 0);
    divGrad.addColorStop(0, 'rgba(0,212,255,0)');
    divGrad.addColorStop(0.5, 'rgba(0,212,255,0.4)');
    divGrad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, headerH - 14);
    ctx.lineTo(width - 70, headerH - 14);
    ctx.stroke();

    let rowY = headerH;
    for (let i = 0; i < numRows; i++) {
        const user = users[i];
        if (!user) continue;

        const avatarBuffer = await fetchImageBuffer(user.avatarUrl);
        await drawUserRow(ctx, innerX, rowY, rowW, rowH, i + 1, user, avatarBuffer);
        rowY += rowH + rowGap;
    }

    return canvas.toBuffer('image/png');
}

async function drawUserRow(ctx: any, x: number, y: number, w: number, h: number, rank: number, user: LeaderboardUser, avatarBuffer: Buffer | null) {
    roundedRect(ctx, x, y, w, h, 16, 'rgba(17,26,48,0.8)');
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawRankBadge(ctx, rank, x + 40, y + h / 2, 55);

    const avatarRadius = 30;
    await drawCircularImage(ctx, avatarBuffer, x + 105, y + h / 2, avatarRadius);

    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 105, y + h / 2, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    const centerX = x + 155;
    const centerY = y + h / 2;

    const line1Size = 18;
    const line2Size = 13;
    const lineGap = 6;

    const blockHeight = line1Size + lineGap + line2Size;
    const blockTop = centerY - blockHeight / 2;

    ctx.textAlign = 'left';
    ctx.font = `${line1Size}px RubikBold`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(user.username, centerX, blockTop + line1Size);

    ctx.font = `${line2Size}px Rubik`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`User ID: ${user.userId}`, centerX, blockTop + line1Size + lineGap + line2Size);

    ctx.font = '16px RubikBold';
    let totalWins;

    if (user.wins === 1) {
        totalWins = '1 win';
    } else {
        totalWins = `${user.wins} wins`;
    }

    const winsText = `${totalWins}`;
    const winsW = ctx.measureText(winsText).width;
    const badgePadX = 16;
    const badgeW = winsW + badgePadX * 2;
    const badgeH = 40;
    const badgeX = x + w - badgeW - 16;
    const badgeY = y + (h - badgeH) / 2;

    const winsColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.green;
    const glowColor = rank === 1 ? 'rgba(255,215,0,0.25)' : rank === 2 ? 'rgba(192,192,192,0.2)' : rank === 3 ? 'rgba(205,127,50,0.2)' : 'rgba(0,255,178,0.25)';

    drawGlow(ctx, badgeX + badgeW / 2, badgeY + badgeH / 2, 45, glowColor);
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 10, winsColor + '18');
    ctx.strokeStyle = winsColor + '55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '16px RubikBold';
    ctx.fillStyle = winsColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winsText, badgeX + badgeW / 2, badgeY + badgeH / 2);
}
export async function renderGlobalLeaderboard(guilds: LeaderboardGuild[], botAvatarUrl: string): Promise<Buffer> {
    const scale = 2
    const width = 900;
    const padX = 40;
    const innerX = padX + 35;
    const rowW = width - (padX + 35) * 2;
    const rowH = 100;
    const rowGap = 12;
    const headerH = 200;
    const numRows = Math.min(guilds.length, 10);
    const height = headerH + numRows * (rowH + rowGap) - rowGap + 55;

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fill();
    }

    drawGlow(ctx, 100, 100, 200, 'rgba(0,212,255,0.15)');
    drawGlow(ctx, width - 80, height - 80, 240, 'rgba(59,130,246,0.10)');

    roundedRect(ctx, padX, padX, width - padX * 2, height - padX * 2, 28, 'rgba(13,19,36,0.92)');
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '64px RubikBold';
    const titleGrad = ctx.createLinearGradient(60, 60, 380, 60);
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGrad;
    ctx.fillText('GLOBAL', 70, 118);

    ctx.font = '24px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('SERVER LEADERBOARD', 74, 152);

    ctx.font = '15px RubikBold';
    const statsText = `${guilds.length} ${guilds.length === 1 ? 'Server' : 'Servers'} Competing`;
    const statsW = ctx.measureText(statsText).width;

    const badgePadX = 14;
    const badgeW = statsW + badgePadX * 2;
    const badgeH = 50;
    const badgeX = width - padX - badgeW - 20;
    const badgeY = 68;

    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 12, 'rgba(0,212,255,0.07)');
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.stroke();

    ctx.font = '14px RubikBold';
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(statsText, badgeX + badgeW / 2, badgeY + badgeH / 2);

    const divGrad = ctx.createLinearGradient(70, 0, width - 70, 0);
    divGrad.addColorStop(0, 'rgba(0,212,255,0)');
    divGrad.addColorStop(0.5, 'rgba(0,212,255,0.4)');
    divGrad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, headerH - 14);
    ctx.lineTo(width - 70, headerH - 14);
    ctx.stroke();

    let rowY = headerH;
    for (let i = 0; i < numRows; i++) {
        const guild = guilds[i];
        if (!guild) continue;
        const iconBuffer = await fetchImageBuffer(guild.iconUrl || botAvatarUrl);
        await drawGuildRow(ctx, innerX, rowY, rowW, rowH, i + 1, guild, iconBuffer);
        rowY += rowH + rowGap;
    }

    return canvas.toBuffer('image/png');
}

async function drawGuildRow(ctx: any, x: number, y: number, w: number, h: number, rank: number, guild: LeaderboardGuild, iconBuffer: Buffer | null) {
    roundedRect(ctx, x, y, w, h, 16, 'rgba(17,26,48,0.8)');
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawRankBadge(ctx, rank, x + 40, y + h / 2, 55);

    const iconRadius = 30;
    await drawCircularImage(ctx, iconBuffer, x + 105, y + h / 2, iconRadius);

    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 105, y + h / 2, iconRadius, 0, Math.PI * 2);
    ctx.stroke();

    const centerX = x + 155;
    const centerY = y + h / 2;

    const line1Size = 18;
    const line2Size = 13;
    const lineGap = 6;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = `${line1Size}px RubikBold`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(guild.guildName, centerX, centerY - 8);

    ctx.font = `${line2Size}px Rubik`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`Guild ID: ${guild.guildId}`, centerX, centerY + 12);

    ctx.font = '16px RubikBold';
    let totalWins;

    if (guild.totalWins === 1) {
        totalWins = '1 win';
    } else {
        totalWins = `${guild.totalWins} wins`;
    }

    const winsText = `${totalWins}`;
    const winsW = ctx.measureText(winsText).width;
    const badgePadX = 16;
    const badgeW = winsW + badgePadX * 2;
    const badgeH = 40;
    const badgeX = x + w - badgeW - 16;
    const badgeY = y + (h - badgeH) / 2;

    const winsColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.cyanSoft;
    const glowColor = rank === 1 ? 'rgba(255,215,0,0.25)' : rank === 2 ? 'rgba(192,192,192,0.2)' : rank === 3 ? 'rgba(205,127,50,0.2)' : 'rgba(0,212,255,0.25)';

    drawGlow(ctx, badgeX + badgeW / 2, badgeY + badgeH / 2, 45, glowColor);
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 10, winsColor + '18');
    ctx.strokeStyle = winsColor + '55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '16px RubikBold';
    ctx.fillStyle = winsColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winsText, badgeX + badgeW / 2, badgeY + badgeH / 2);
}