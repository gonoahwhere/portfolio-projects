import fs from 'fs';
import path from 'path';
import fl from 'fluident';
import { pathToFileURL } from 'url';

type ButtonHandler = (interaction: any) => any | Promise<any>;
const buttonHandlers: ButtonHandler[] = [];
const buttonsPath = path.join(process.cwd(), "dist", "events", "buttons");

export const loadButtonHandlers = async () => {
    const files = fs.readdirSync(buttonsPath).filter(f => f.endsWith(".js") || f.endsWith(".ts"));
        
    for (const file of files) {
        if (file === 'index.ts') continue;
        
        const filePath = path.join(buttonsPath, file);
        try {
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(fileUrl);
            const handler = module.default;
            if (typeof handler === "function") {
                buttonHandlers.push(handler);
            } else {
                // nothing
            }
        } catch (err) {
            const error = err as Error;
            console.error(fl.red(`[ERROR] Failed to load ${file}: ${error.message}`));
        }
    }
    
    return buttonHandlers;
}

export default buttonHandlers;