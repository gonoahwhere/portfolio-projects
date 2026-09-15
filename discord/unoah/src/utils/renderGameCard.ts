import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import path from "path";
import type { Lobby } from "../utils/lobbies.js";
import type { CardFile } from "../utils/cards.js";

const COLOR_MAP: Record<string, string> = {
    green:  "G",
    orange: "O",
    pink:   "P",
    blue:   "B",
};

GlobalFonts.registerFromPath(
    path.join(process.cwd(), "dist/assets/fonts/Rubik-Bold.ttf"),
    "RubikBold"
);

GlobalFonts.registerFromPath(
    path.join(process.cwd(), "dist/assets/fonts/Rubik-Regular.ttf"),
    "Rubik"
);

const COLORS = {
    bgTop: "#040814",
    bgBottom: "#0A1022",
    cyan: "#00D4FF",
    text: "#F4F8FF",
    muted: "#7E8CA8",
};

export async function renderGameCard(lobby: Lobby, theme: string): Promise<Buffer> {
    const canvas = createCanvas(1200, 700);
    const ctx = canvas.getContext("2d");
    const bg = ctx.createLinearGradient(0, 0, 0, 700);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 700);

    for (let i = 0; i < 120; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(Math.random() * 1200, Math.random() * 700, 1.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGlow(ctx, 200, 120, 220, "rgba(0,212,255,0.15)");
    drawGlow(ctx, 1000, 600, 300, "rgba(59,130,246,0.10)");

    const currentPlayer = lobby.players.find(p => p.id === lobby.currentTurn);

    ctx.font = "72px RubikBold";
    const title = "GAME STARTED";
    const gradient = ctx.createLinearGradient(60, 60, 500, 60);
    gradient.addColorStop(0, "#FFFFFF");
    gradient.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = gradient;
    const titleX = 40;
    const titleY = 80;

    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, titleX, titleY);
    ctx.font = "28px Rubik";
    ctx.fillStyle = COLORS.muted;
    const subtitle = `${lobby.players.length} players in game: ${currentPlayer?.username ?? "Unknown"}'s turn`;
    const subtitleWidth = ctx.measureText(subtitle).width;
    const titleCenterX = titleX + titleWidth / 2;
    const subtitleX = titleCenterX - subtitleWidth / 2;
    ctx.fillText(subtitle, subtitleX, 120);

    const CARD_W = 220;
    const CARD_H = 320;
    const canvasW = 1200;
    const gap = 160;
    const totalWidth = CARD_W * 2 + gap;
    const startX = (canvasW - totalWidth) / 2;
    const centerXCard = startX;
    const pickupX = startX + CARD_W + gap;
    const y = 200;

    if (lobby.centerCard) {
        const cardName = lobby.centerCard.name.toLowerCase().replace(".png", "");
        const chosenColor = (lobby.centerCard as any).chosenColor as string | undefined;
        let imagePath = lobby.centerCard.path;

        if ((cardName === "wild" || cardName === "draw4") && chosenColor) {
            const colorLetter = COLOR_MAP[chosenColor];
            if (colorLetter) {
                const coloredFilename = `${cardName.toUpperCase()}_${colorLetter}.png`;
                imagePath = path.join(process.cwd(), "dist/assets/themes", theme, coloredFilename);
            }
        }

        try {
            const centerImg = await loadImage(imagePath);
            ctx.drawImage(centerImg, centerXCard, y, CARD_W, CARD_H);
        } catch (e) {
            console.error(`Failed to load center card image at "${imagePath}":`, e);
        }
    }

    const pickupPath = path.join(process.cwd(), "dist/assets/themes", theme, "BACKGROUND.png");
    const pickupImg = await loadImage(pickupPath);
    ctx.drawImage(pickupImg, pickupX, y, CARD_W, CARD_H);
    ctx.font = "22px Rubik";
    ctx.fillStyle = COLORS.muted;
    const centerLabel = "DISCARD";
    const pickupLabel = "PICKUP";
    const centerLabelWidth = ctx.measureText(centerLabel).width;
    const pickupLabelWidth = ctx.measureText(pickupLabel).width;
    ctx.fillText(centerLabel, centerXCard + CARD_W / 2 - centerLabelWidth / 2, y + CARD_H + 40);
    ctx.fillText(pickupLabel, pickupX + CARD_W / 2 - pickupLabelWidth / 2, y + CARD_H + 40);
    return canvas.toBuffer("image/png");
}

function drawGlow(ctx: any, x: number, y: number, radius: number, color: string) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

export async function renderHand(hand: CardFile[], theme: string): Promise<Buffer> {
    const CARD_W = 140;
    const CARD_H = 200;
    const GAP = 10;
    const PADDING = 20;

    const totalW = PADDING * 2 + hand.length * CARD_W + (hand.length - 1) * GAP;
    const totalH = CARD_H + PADDING * 2;

    const canvas = createCanvas(totalW, totalH);
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 0, totalH);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, totalW, totalH);

    for (let [i, card] of hand.entries()) {
        const img = await loadImage(card.path);
        const x = PADDING + i * (CARD_W + GAP);
        ctx.drawImage(img, x, PADDING, CARD_W, CARD_H);
    }

    return canvas.toBuffer("image/png");
}