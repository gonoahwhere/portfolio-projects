import fs from 'fs';
import path from 'path';

export type CardFile = {
    name: string;
    path: string;
};

export function isPlayableCard(name: string) {
    return (
        /^[0-9][A-Z]\.png$/i.test(name) ||
        /^WILD\.png$/i.test(name) ||
        /^DRAW4\.png$/i.test(name) ||
        /^(SKIP|REVERSE|DRAW2)_[A-Z]\.png$/i.test(name)
    );
}

export function buildDeck(theme: string): CardFile[] {
    const dir = path.join(process.cwd(), 'dist/assets/themes', theme);

    if (!fs.existsSync(dir)) {
        throw new Error(`Theme not found: ${theme}`);
    }

    const card = (name: string): CardFile => ({ name, path: path.join(dir, name) });
    const deck: CardFile[] = [];
    const colors = ['G', 'O', 'P', 'B'];

    for (const color of colors) {
        deck.push(card(`0${color}.png`));

        for (let n = 1; n <= 9; n++) {
            deck.push(card(`${n}${color}.png`));
            deck.push(card(`${n}${color}.png`));
        }

        for (const action of ['SKIP', 'REVERSE', 'DRAW2']) {
            deck.push(card(`${action}_${color}.png`));
            deck.push(card(`${action}_${color}.png`));
        }
    }

    for (let i = 0; i < 4; i++) {
        deck.push(card('WILD.png'));
        deck.push(card('DRAW4.png'));
    }

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j]!, deck[i]!];
    }

    return deck;
}

export function pickCenterCard(deck: CardFile[]): CardFile {
    if (deck.length === 0) {
        throw new Error("Cannot pick center card from empty deck");
    }
    const numbers = deck.filter(c => /^[0-9]/.test(c.name));
    const pool = numbers.length > 0 ? numbers : deck;
    const card = pool[Math.floor(Math.random() * pool.length)];
    if (!card) {
        throw new Error("Failed to pick center card");
    }
    return card;
}