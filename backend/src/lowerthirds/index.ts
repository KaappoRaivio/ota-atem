import { LowerThirdsOptions } from "../types/lowerThirdsOptions";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import config from "../../config.json";

import { Atem } from "atem-connection";
import lowerThirdsTexts from "../../lowerthirds.json";

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
    const imageBuffer = await sharp(pngBuffer).ensureAlpha().raw().toBuffer(); // convert to RGBA buffer
    return imageBuffer;
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
                const lowerThirdsOptions = lowerThirdsTexts[this.currentTextIndex];
                const imageBuffer = await render(lowerThirdsOptions);
                await this.atemConsole.uploadStill(config.lowerThirds.mediaIndex, imageBuffer, lowerThirdsOptions.title, lowerThirdsOptions.subtitle);
            };
            inner().then(resolve);
        });
    }
}

export { LowerThirdsManager };
