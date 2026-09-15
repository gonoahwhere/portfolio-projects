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
    green: '#00FFB2',
    red: '#FF5C7A',
    yellow: '#FFD700',
};

export interface ServerSettings {
    guildId: string;
    guildName?: string;
    theme: 'light' | 'dark';
    [key: string]: boolean | string | undefined;
}

interface SettingDefinition {
    key: keyof ServerSettings;
    label: string;
    description: string;
    type: 'toggle' | 'theme';
}

const SETTING_DEFINITIONS: SettingDefinition[] = [
    {
        key: 'theme',
        label: 'Card Theme',
        description: 'Visual theme for generated cards',
        type: 'theme',
    },
    {
        key: 'lb',
        label: 'Leaderboard Opt-In',
        description: 'Opt-in to global leaderboard tracking.',
        type: 'toggle',
    },
    // Add more settings here as your schema grows
];

export async function renderServerSettings(settings: ServerSettings): Promise<Buffer> {
    const width = 900;
    const padX = 40;
    const innerX = padX + 35;
    const slotW = width - (padX + 35) * 2;
    const slotH = 96;
    const slotGap = 14;
    const slotsStartY = 215;
    const numSlots = SETTING_DEFINITIONS.length;
    const height = slotsStartY + numSlots * (slotH + slotGap) - slotGap + 55;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

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
    ctx.fillText('UNOAH', 70, 118);

    ctx.font = '24px Rubik';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('SERVER SETTINGS', 74, 152);

    const serverName = settings.guildName ?? 'Unknown Server';
    const idLine = `ID: ${settings.guildId}`;

    ctx.font = '15px RubikBold';
    const nameW = ctx.measureText(serverName).width;
    ctx.font = '13px Rubik';
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
    ctx.fillText(serverName, badgeX + badgePadX, blockTop + line1Size);

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
    ctx.moveTo(70, slotsStartY - 14);
    ctx.lineTo(width - 70, slotsStartY - 14);
    ctx.stroke();

    let slotY = slotsStartY;
    for (const def of SETTING_DEFINITIONS) {
        drawSettingSlot(ctx, innerX, slotY, slotW, slotH, def, settings);
        slotY += slotH + slotGap;
    }

    return canvas.toBuffer('image/png');
}

function drawSettingSlot(ctx: any, x: number, y: number, w: number, h: number, def: SettingDefinition, settings: ServerSettings) {
    roundedRect(ctx, x, y, w, h, 18, 'rgba(17,26,48,0.9)');

    let statusColor: string;
    let statusLabel: string;
    let badgeGlow: string;

    if (def.type === 'theme') {
        const isLight = settings.theme === 'light';
        statusColor = isLight ? COLORS.yellow : COLORS.cyanSoft;
        statusLabel = isLight ? 'LIGHT' : 'DARK';
        badgeGlow = isLight ? 'rgba(255,215,0,0.30)' : 'rgba(0,212,255,0.30)';
    } else {
        const val = settings[def.key] as boolean;
        statusColor = val ? COLORS.green : COLORS.red;
        statusLabel = val ? 'ENABLED' : 'DISABLED';
        badgeGlow = val ? 'rgba(0,255,178,0.28)' : 'rgba(255,92,122,0.28)';
    }

    ctx.strokeStyle = statusColor + '44';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const dotX = x + 30;
    const dotY = y + h / 2;
    drawGlow(ctx, dotX, dotY, 28, badgeGlow);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();

    const labelSize = 26;
    const descSize = 18;
    const textGap = 8;
    const textBlockH = labelSize + textGap + descSize;
    const textBlockTop = y + (h - textBlockH) / 2;

    ctx.font = `${labelSize}px RubikBold`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(def.label, x + 55, textBlockTop + labelSize);

    ctx.font = `${descSize}px Rubik`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(def.description, x + 55, textBlockTop + labelSize + textGap + descSize);

    ctx.font = '18px RubikBold';
    const lW = ctx.measureText(statusLabel).width;
    const bPadX = 18;
    const bW = lW + bPadX * 2;
    const bH = 34;
    const bX = x + w - bW - 14;
    const bY = y + (h - bH) / 2;

    const badgeLabelSize = 18;
    roundedRect(ctx, bX, bY, bW, bH, 10, statusColor + '18');
    ctx.strokeStyle = statusColor + '55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `${badgeLabelSize}px RubikBold`;
    ctx.fillStyle = statusColor;
    ctx.fillText(statusLabel, bX + bPadX, bY + (bH + badgeLabelSize) / 2 - 2);
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