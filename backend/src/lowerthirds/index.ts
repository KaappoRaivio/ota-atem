import { LowerThirdsOptions } from "../types/lowerThirdsOptions";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import config from "../../config.json";

import { Atem, AtemState } from "atem-connection";
import { AtemEvent } from "enums";
import { AtemEventHandlers } from "comm";
import { MediaPreparationRequest } from "mediaPreparationRequest";

const templateHTML = fs.readFileSync(path.resolve(__dirname, "./lowerthirds.html.template"), {
    encoding: "utf-8",
});
const template = Handlebars.compile(templateHTML);

async function render(lowerThirdsOptions: LowerThirdsOptions) {
    const compiled = template({
        title: lowerThirdsOptions.title,
        subtitle: lowerThirdsOptions.subtitle,
    });
    const pngBuffer = await takeScreenshot(compiled);
    if (pngBuffer === undefined) throw new Error("Invalid PNG buffer");
    // convert to RGBA buffer
    return await sharp(pngBuffer).ensureAlpha().raw().toBuffer();
}

async function takeScreenshot(html: string) {
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.screenshot();
    await browser.close();
    return buffer as Buffer;
}

class LowerThirdsManager {
    private lowerThirdsData: LowerThirdsOptions[];
    private currentTextIndex: number;
    private atemConsole: Atem;

    constructor(lowerThirdsData: LowerThirdsOptions[], atemConsole: Atem) {
        this.lowerThirdsData = lowerThirdsData;
        this.currentTextIndex = 0;
        this.atemConsole = atemConsole;
    }

    public nextLowerThirds(): void {
        console.log("Next lower thirds");
        this.currentTextIndex = (this.currentTextIndex + 1) % this.lowerThirdsData.length;
        this.prepareNextLowerThirds();
    }

    public setLowerThirdsIndex(index: number): void {
        this.currentTextIndex = index % this.lowerThirdsData.length;
        this.prepareNextLowerThirds();
    }

    private prepareNextLowerThirds() {
        const lowerThirdsUploadedPromise = new Promise<void>(resolve => {
            const inner = async () => {
                const lowerThirdsOptions = this.lowerThirdsData[this.currentTextIndex];
                const imageBuffer = await render(lowerThirdsOptions);
                await this.atemConsole.uploadStill(config.lowerThirds.mediaIndex, imageBuffer, lowerThirdsOptions.title, lowerThirdsOptions.subtitle);
                console.log("Updloaded");
            };
            inner().then(resolve).catch(console.error);
        });
    }

    setLowerThirds(lowerThirdsData: LowerThirdsOptions[]): void {
        console.log(this.lowerThirdsData);
        this.lowerThirdsData = lowerThirdsData;
        console.log(this.lowerThirdsData);
        this.setLowerThirdsIndex(0);
    }
}

const getLowerThirdsHandlers = (lowerThirdsManager: LowerThirdsManager): AtemEventHandlers => {
    let lastMacroIndex: number = -1;
    const handleMacros = (atemConsole: Atem, eventType: AtemEvent, state: AtemState, paths: string[]) => {
        paths.forEach(async path => {
            if (path.startsWith("macro.macroPlayer")) {
                console.log(path);
                const macroState = state.macro.macroPlayer;
                const { macroIndex, isRunning } = macroState;
                console.log(macroState);

                if (macroIndex === config.lowerThirds.macroIndex && isRunning) {
                    console.log("Macro started");
                    console.log("-----------------------------------------------");
                    lastMacroIndex = macroIndex;
                } else if (lastMacroIndex === config.lowerThirds.macroIndex && !isRunning) {
                    lastMacroIndex = -1;
                    console.log("Macro ended");

                    lowerThirdsManager.nextLowerThirds();
                }
            }
        });
    };

    return {
        connected: [],
        stateChanged: [handleMacros],
        error: [],
        info: [],
    } as AtemEventHandlers;
};

export { LowerThirdsManager, getLowerThirdsHandlers };
