import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Bold.ttf'), 'RubikBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'dist/assets/fonts/Rubik-Regular.ttf'), 'Rubik');

const COLORS = {
    bgTop: '#040814',
    bgBottom: '#0A1022',
    cyan: '#00D4FF',
    cyanSoft: '#6EE7FF',
    text: '#F4F8FF',
    muted: '#7E8CA8',
};

interface GuideEntry {
    number: number;
    label: string;
    description: string;
}

const GUIDE_ENTRIES: GuideEntry[] = [
    { number: 1, label: 'OBJECTIVE', description: 'Be the first player to clear out all of your cards.' },
    { number: 2, label: 'PLAYING', description: 'After the lobby has started, players take turns via DM, simply type the card you want to play.' },
    { number: 3, label: 'TAKING A TURN', description: 'Play a card that matches the middle card by colour or value.' },
    { number: 4, label: 'WILD', description: 'Lets you pick what the next colour should be. Can be played on any card.' },
    { number: 5, label: 'DRAW 2', description: 'Forces the next opponent to draw two cards.' },
    { number: 6, label: 'DRAW 4', description: 'Forces the next opponent to draw four cards.' },
    { number: 7, label: 'SKIP', description: "Skips the next player's turn." },
    { number: 8, label: 'REVERSE', description: "Also skips the next player's turn in 2 player games, or reverses the direction of play." },
    { number: 9, label: 'UNOAH', description: 'Got 1 card remaining? Say UNOAH when you take your turn!' },
];

export async function renderGuide(): Promise<Buffer> {
    const width = 1200;
    const rowH = 50;
    const rowGap = 6;
    const startY = 198;
    const paddingBottom = 75;
    const contentHeight = GUIDE_ENTRIES.length * (rowH + rowGap) - rowGap;
    const height = startY + contentHeight + paddingBottom;
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

    roundedRect(ctx, 40, 40, 1120, height - 80, 30, 'rgba(13,19,36,0.92)');
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '72px RubikBold';
    const titleGrad = ctx.createLinearGradient(60, 60, 580, 60);
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGrad;
    ctx.fillText('HOW TO PLAY', 70, 120);

    ctx.font = '28px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('UNOAH GUIDE', 74, 155);

    const divider = ctx.createLinearGradient(70, 190, 1130, 190);
    divider.addColorStop(0, 'rgba(0,212,255,0)');
    divider.addColorStop(0.5, 'rgba(0,212,255,0.4)');
    divider.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.strokeStyle = divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 183);
    ctx.lineTo(1130, 183);
    ctx.stroke();

    const rowX = 75;
    const rowW = 1050;

    for (let i = 0; i < GUIDE_ENTRIES.length; i++) {
        const entry = GUIDE_ENTRIES[i];
        if (!entry) continue;
        const y = startY + i * (rowH + rowGap);
        drawGuideRow(ctx, rowX, y, rowW, rowH, entry);
    }

    return canvas.toBuffer('image/png');
}

function drawGuideRow(ctx: any, x: number, y: number, w: number, h: number, entry: GuideEntry) {
    roundedRect(ctx, x, y, w, h, 14, 'rgba(17,26,48,0.9)');
    ctx.strokeStyle = 'rgba(0,212,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const badgeW = 54;
    const badgeH = 32;
    const bX = x + 14;
    const bY = y + (h - badgeH) / 2;

    drawGlow(ctx, bX + badgeW / 2, y + h / 2, 30, 'rgba(0,212,255,0.20)');
    roundedRect(ctx, bX, bY, badgeW, badgeH, 8, 'rgba(0,212,255,0.12)');
    ctx.strokeStyle = 'rgba(0,212,255,0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '17px RubikBold';
    ctx.fillStyle = COLORS.cyan;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${entry.number}`, bX + badgeW / 2, y + h / 2);

    const textX = x + 82;
    const midY = y + h / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = '22px RubikBold';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(entry.label, textX, midY - 1);

    const labelW = ctx.measureText(entry.label).width;

    const dotGap = 12;
    ctx.font = '22px Rubik';
    ctx.fillStyle = 'rgba(126,140,168,0.5)';
    ctx.fillText('•', textX + labelW + dotGap, midY - 1);

    const dotW = ctx.measureText('•').width;

    // Description
    ctx.font = '19px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(entry.description, textX + labelW + dotGap + dotW + dotGap, midY - 1);
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