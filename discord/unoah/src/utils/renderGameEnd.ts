import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";

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

function drawGlow(ctx: any, x: number, y: number, radius: number, color: string) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

export async function renderGameEnd(winnerUsername: string): Promise<Buffer> {
    const canvas = createCanvas(1200, 700);
    const ctx = canvas.getContext("2d");
    const W = 1200;
    const H = 700;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, COLORS.bgTop);
    bg.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 120; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, 1.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGlow(ctx, 600, 300, 400, "rgba(0,212,255,0.12)");
    drawGlow(ctx, 200, 120, 220, "rgba(0,212,255,0.10)");
    drawGlow(ctx, 1000, 600, 300, "rgba(59,130,246,0.10)");

    ctx.textAlign = "center";

    const title = "GAME OVER";
    ctx.font = "120px RubikBold";
    const titleGradient = ctx.createLinearGradient(0, 250, W, 250);
    titleGradient.addColorStop(0, "#FFFFFF");
    titleGradient.addColorStop(1, COLORS.cyan);
    ctx.fillStyle = titleGradient;
    ctx.fillText(title, W / 2, 320);

    const subtitle = `${winnerUsername} won!`;
    ctx.font = "48px Rubik";
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(subtitle, W / 2, 400);

    return canvas.toBuffer("image/png");
}