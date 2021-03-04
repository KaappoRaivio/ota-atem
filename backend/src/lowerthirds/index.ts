import { LowerThirdsOptions } from "../types/lowerThirdsOptions";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import config from "../../config.json";

import { Atem, AtemState } from "atem-connection";
import { AtemEvent } from "enums";
import { AtemEventHandlers, MediaStateMessage } from "comm";
import { MediaPreparationRequest } from "mediaPreparationRequest";
import { TransferState } from "atem-connection/dist/enums";
import { MyWebSocketServer } from "../wss";
import { send } from "process";

async function render(lowerThirdsOptions: LowerThirdsOptions) {
    const templateHTML = fs.readFileSync(path.resolve(__dirname, lowerThirdsOptions.templateFile), {
        encoding: "utf-8",
    });
    const template = Handlebars.compile(templateHTML);
    const compiled = template(lowerThirdsOptions.texts);
    const pngBuffer = await takeScreenshot(compiled);
    if (pngBuffer === undefined) throw new Error("Invalid PNG buffer");
    // convert to RGBA buffer
    const buf = await sharp(pngBuffer).ensureAlpha().raw().toBuffer();
    let outputBuf = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i += 4) {
        let r = buf[i];
        let g = buf[i + 1];
        let b = buf[i + 2];
        let a = buf[i + 3];

        if (g > 55 && r < 30 && b < 113) {
            a = 0;
        }

        outputBuf[i] = r * (a / 255);
        outputBuf[i + 1] = g * (a / 255);
        outputBuf[i + 2] = b * (a / 255);
        outputBuf[i + 3] = a;
    }
    return outputBuf;
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
    get lowerThirdsData(): LowerThirdsOptions[] {
        return this._lowerThirdsData;
    }
    private _lowerThirdsData: LowerThirdsOptions[];
    private currentTextIndex: number;
    private atemConsole: Atem;
    public webSocketServer: MyWebSocketServer;

    constructor(lowerThirdsData: LowerThirdsOptions[], atemConsole: Atem) {
        this._lowerThirdsData = lowerThirdsData;
        this.currentTextIndex = 0;
        this.atemConsole = atemConsole;
    }

    public sendMediaWS() {
        const index = this.getLowerThirdsIndex();
        const data = this.lowerThirdsData[index];
        const msg = {
            type: "media",
            currentIndex: index,
            currentValues: {
                title: data.texts.title,
                subtitle: data.texts.subtitle,
            },
        } as MediaStateMessage;
        console.log(msg);
        this.webSocketServer.broadcastWsMessage(msg);
        this.webSocketServer.setMediaState(msg);
    }

    public nextLowerThirds(): void {
        console.log("Next lower thirds");
        this.currentTextIndex = (this.currentTextIndex + 1) % this._lowerThirdsData.length;
        this.prepareNextLowerThirds();
        this.sendMediaWS();
    }

    public setLowerThirdsIndex(index: number): void {
        this.currentTextIndex = index % this._lowerThirdsData.length;
        this.prepareNextLowerThirds();
        this.sendMediaWS();
    }

    public getLowerThirdsIndex(): number {
        return this.currentTextIndex;
    }

    private prepareNextLowerThirds() {
        const lowerThirdsUploadedPromise = new Promise<void>(resolve => {
            const inner = async () => {
                const lowerThirdsOptions = this._lowerThirdsData[this.currentTextIndex];
                const imageBuffer = await render(lowerThirdsOptions);
                const result = await this.atemConsole.uploadStill(config.lowerThirds.mediaIndex, imageBuffer, "Ota-atem image", "Ota-atem image");
                console.log(result.state === TransferState.Finished);
            };
            inner().then(resolve).catch(console.error);
        });
    }

    setLowerThirds(lowerThirdsData: LowerThirdsOptions[]): void {
        console.log(this._lowerThirdsData);
        this._lowerThirdsData = lowerThirdsData;
        console.log(this._lowerThirdsData);
        this.setLowerThirdsIndex(0);
    }
}

const getLowerThirdsHandlers = (webSocketServer: MyWebSocketServer, lowerThirdsManager: LowerThirdsManager): AtemEventHandlers => {
    lowerThirdsManager.webSocketServer = webSocketServer;
    return {
        connected: [() => lowerThirdsManager.setLowerThirdsIndex(0), () => lowerThirdsManager.sendMediaWS],
        stateChanged: [],
        error: [],
        info: [],
    } as AtemEventHandlers;
};

export { LowerThirdsManager, getLowerThirdsHandlers };
