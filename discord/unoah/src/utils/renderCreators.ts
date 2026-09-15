import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fetch from 'node-fetch';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Bold.ttf'), 'RubikBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Regular.ttf'), 'Rubik');

const COLORS = {
    bgTop: '#040814',
    bgBottom: '#0A1022',
    cyan: '#00D4FF',
    cyanSoft: '#6EE7FF',
    text: '#F4F8FF',
    muted: '#7E8CA8',
    yellow: '#FFD700',
};

const CREATORS = [
    {
        tag: 'gonoahwhere',
        id: '372456601266683914',
        role: 'Developer',
    },
    {
        tag: 'null8626',
        id: '661200758510977084',
        role: 'Developer',
    },
];

const LAYOUT = {
    headerHeight: 210,
    startY: 210,
    cardH: 110,
    gap: 18,
    bottomPadding: 60,
};

async function fetchAvatarBuffer(userId: string): Promise<Buffer | null> {
    try {
        const res = await fetch(`https://cdn.discordapp.com/avatars/${userId}/`, { method: 'HEAD' });
    } catch {}
    return null;
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch {
        return null;
    }
}

async function drawCircularImage(ctx: any, buffer: Buffer | null, x: number, y: number, radius: number) {
    if (!buffer) return;
    try {
        const img = await loadImage(buffer);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.beginPath();
        ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
    } catch (err) {
        console.error('Failed to draw circular image', err);
    }
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

export async function renderCreators(noahAvatarUrl?: string, nullAvatarUrl?: string): Promise<Buffer> {
    const width = 1200;
    const height = LAYOUT.headerHeight + CREATORS.length * LAYOUT.cardH + (CREATORS.length - 1) * LAYOUT.gap + LAYOUT.bottomPadding;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 120; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
    }

    drawGlow(ctx, 150, 120, 220, 'rgba(0,212,255,0.18)');
    drawGlow(ctx, 950, 650, 300, 'rgba(59,130,246,0.12)');

    const panelPaddingBottom = 40;
    const panelH = height - 80;
    roundedRect(ctx, 40, 40, 1120, panelH, 30, 'rgba(13,19,36,0.92)');
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '72px RubikBold';
    const titleGrad = ctx.createLinearGradient(60, 60, 520, 60);
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGrad;
    ctx.fillText('CREATORS', 70, 120);

    ctx.font = '28px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('MADE WITH LOVE BY:', 74, 155);

    const divider = ctx.createLinearGradient(70, 0, 1130, 0);
    divider.addColorStop(0, 'rgba(0,212,255,0)');
    divider.addColorStop(0.5, 'rgba(0,212,255,0.4)');
    divider.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.strokeStyle = divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 183);
    ctx.lineTo(1130, 183);
    ctx.stroke();

    const avatarUrls = [noahAvatarUrl, nullAvatarUrl];
    const [noahBuffer, nullBuffer] = await Promise.all(avatarUrls.map(url => url ? fetchImageBuffer(url) : Promise.resolve(null)));

    const avatarBuffers = [noahBuffer, nullBuffer];
    const startX = 75;
    const startY = LAYOUT.startY;

    const cardW = 1050;

    for (let i = 0; i < CREATORS.length; i++) {
        const creator = CREATORS[i];
        if (!creator) continue;

        const cy = startY + i * (LAYOUT.cardH + LAYOUT.gap);
        const buf = avatarBuffers[i] ?? null;

        await drawCreatorCard(ctx, startX, cy, cardW, LAYOUT.cardH, creator, buf);
    }

    return canvas.toBuffer('image/png');
}

async function drawCreatorCard(
    ctx: any,
    x: number,
    y: number,
    w: number,
    h: number,
    creator: { tag: string; id: string; role: string },
    avatarBuffer: Buffer | null
) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    
    // SAME BASE ROW STYLE AS LEADERBOARD
    roundedRect(ctx, x, y, w, h, 16, 'rgba(17,26,48,0.8)');
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const avatarRadius = 35;

    // avatar (same positioning as leaderboard)
    await drawCircularImage(ctx, avatarBuffer, x + 105, y + h / 2, avatarRadius);

    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 105, y + h / 2, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    const labelX = x + 155;
    const centerY = y + h / 2;

    // username
    ctx.font = '25px RubikBold';
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';
    ctx.fillText(creator.tag, labelX, centerY - 6);

    // subtext (ONLY ID — remove "Developer")
    ctx.font = '20px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`User ID: ${creator.id}`, labelX, centerY + 24);

    // DEV BADGE (replaces wins badge exactly)
    const devText = 'DEV';

    ctx.font = '16px RubikBold';
    const devW = ctx.measureText(devText).width;

    const badgePadX = 16;
    const badgeW = devW + badgePadX * 2;
    const badgeH = 40;

    const badgeX = x + w - badgeW - 16;
    const badgeY = y + (h - badgeH) / 2;

    // glow
    drawGlow(ctx, badgeX + badgeW / 2, badgeY + badgeH / 2, 45, 'rgba(255,215,0,0.25)');

    // pill
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 10, 'rgba(255,215,0,0.12)');
    ctx.strokeStyle = 'rgba(255,215,0,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // text
    ctx.fillStyle = COLORS.yellow;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(devText, badgeX + badgeW / 2, badgeY + badgeH / 2);
}