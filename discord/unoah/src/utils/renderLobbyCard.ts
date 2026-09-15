import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import type { Lobby } from '../utils/lobbies.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Bold.ttf'), 'RubikBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Regular.ttf'), 'Rubik');

const COLORS = {
    bgTop: '#040814',
    bgBottom: '#0A1022',
    panel: '#0D1324',
    slot: '#111A30',
    border: '#1D2A4A',
    cyan: '#00D4FF',
    cyanSoft: '#6EE7FF',
    blue: '#3B82F6',
    text: '#F4F8FF',
    muted: '#7E8CA8',
    green: '#00FFB2',
    red: '#FF5C7A',
};

export async function renderLobbyCard(lobby: Lobby): Promise<Buffer> {
    const width = 1200;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // BACKGROUND
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // STARTS
    for (let i = 0; i < 120; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
    }

    // GLOWING ORBS
    drawGlow(ctx, 150, 120, 220, 'rgba(0,212,255,0.18)');
    drawGlow(ctx, 950, 650, 300, 'rgba(59,130,246,0.12)');

    // MAIN PANEL
    roundedRect(ctx, 40, 40, 1120, 620, 30, 'rgba(13,19,36,0.92)');
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // HEADER
    ctx.font = '72px RubikBold';
    const titleGradient = ctx.createLinearGradient(60, 60, 400, 60);
    titleGradient.addColorStop(0, '#FFFFFF');
    titleGradient.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGradient;
    ctx.fillText('UNOAH',70, 120);
    ctx.font = '28px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('RANKED LOBBY', 74, 155);

    // PLAYER COUNT
    const pillX = 915;
    const pillY = 70;
    const pillW = 180;
    const pillH = 56;

    roundedRect(ctx, pillX, pillY, pillW, pillH, 18, 'rgba(0,212,255,0.08)');
    ctx.strokeStyle = 'rgba(0,212,255,0.25)';
    ctx.stroke();

    ctx.font = '28px RubikBold';
    ctx.fillStyle = COLORS.cyanSoft;

    const playerText = `${lobby.players.length}/${lobby.maxPlayers}`;
    const playerTextWidth = ctx.measureText(playerText).width;

    const playerTextX = pillX + (pillW - playerTextWidth) / 2;
    const playerTextY = pillY + (pillH + 28) / 2 - 4;

    ctx.fillText(playerText, playerTextX, playerTextY);

    // DIVIDER
    const divider = ctx.createLinearGradient( 70, 190, 1130, 190 );
    divider.addColorStop(0, 'rgba(0,212,255,0)');
    divider.addColorStop(0.5, 'rgba(0,212,255,0.4)');
    divider.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.strokeStyle = divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 200);
    ctx.lineTo(1130, 200);
    ctx.stroke();

    // HOST
    ctx.font = '22px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('HOST', 75, 255);
    ctx.font = '42px RubikBold';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(lobby.players.find(p => p.id === lobby.hostId)?.username ?? 'Unknown', 75, 305);

    // PLAYER SLOTS
    let y = 355;
    for (let i = 0; i < lobby.maxPlayers; i++) {
        const player = lobby.players[i];
        drawPlayerSlot(ctx, 75, y, 1050, 82, player?.username);
        y += 102;
    }

    // STATUS
    const isFull = lobby.players.length >= lobby.maxPlayers;
    const statusColor = isFull ? COLORS.red : COLORS.green;
    const statusText = isFull ? 'LOBBY FULL' : 'WAITING FOR PLAYERS';
    const statusX = 70;
    const statusY = 595;
    const statusW = 315;
    const statusH = 46;

    roundedRect(ctx, statusX, statusY, statusW, statusH, 14, 'rgba(255,255,255,0.04)');
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '24px RubikBold';
    ctx.fillStyle = statusColor;

    const statusTextWidth = ctx.measureText(statusText).width;

    const statusTextX = statusX + (statusW - statusTextWidth) / 2;
    const statusTextY = statusY + (statusH + 24) / 2 - 4;

    ctx.fillText(statusText, statusTextX, statusTextY);
    return canvas.toBuffer('image/png');
}

function drawPlayerSlot(ctx: any, x: number, y: number, width: number, height: number, username?: string) {
    roundedRect(ctx, x, y, width, height, 20, 'rgba(17,26,48,0.9)');
    ctx.strokeStyle = username ? 'rgba(0,212,255,0.22)' : 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ACCENT GLOW
    if (username) {
        drawGlow(ctx, x + 30, y + 40, 40, 'rgba(0,212,255,0.35)');
    }

    // STATUS DOT
    ctx.beginPath();
    ctx.arc(x + 35, y + 41, 7, 0, Math.PI * 2);
    ctx.fillStyle = username ? COLORS.cyan : '#334155';
    ctx.fill();

    // USERNAME
    if (username) {
        ctx.font = '30px RubikBold';
        ctx.fillStyle = COLORS.text;
        ctx.fillText(username, x + 60, y + 52);
    } else {
        ctx.font = '24px Rubik';
        ctx.fillStyle = COLORS.muted;
        ctx.fillText('EMPTY SLOT', x + 60, y + 52);
    }
}

function drawGlow(ctx: any, x: number, y: number, radius: number, color: string) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function roundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number, fill: string) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}