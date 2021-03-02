"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowerThirdsHandlers = exports.LowerThirdsManager = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const config_json_1 = __importDefault(require("../../config.json"));
const enums_1 = require("atem-connection/dist/enums");
const templateHTML = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "./lowerthirds.html.template"), {
    encoding: "utf-8",
});
const template = handlebars_1.default.compile(templateHTML);
async function render(lowerThirdsOptions) {
    const compiled = template({
        title: lowerThirdsOptions.title,
        subtitle: lowerThirdsOptions.subtitle,
    });
    const pngBuffer = await takeScreenshot(compiled);
    if (pngBuffer === undefined)
        throw new Error("Invalid PNG buffer");
    // convert to RGBA buffer
    return await sharp_1.default(pngBuffer).ensureAlpha().raw().toBuffer();
}
async function takeScreenshot(html) {
    const browser = await puppeteer_1.default.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.screenshot();
    await browser.close();
    return buffer;
}
class LowerThirdsManager {
    constructor(lowerThirdsData, atemConsole) {
        this._lowerThirdsData = lowerThirdsData;
        this.currentTextIndex = 0;
        this.atemConsole = atemConsole;
    }
    get lowerThirdsData() {
        return this._lowerThirdsData;
    }
    nextLowerThirds() {
        console.log("Next lower thirds");
        this.currentTextIndex = (this.currentTextIndex + 1) % this._lowerThirdsData.length;
        this.prepareNextLowerThirds();
    }
    setLowerThirdsIndex(index) {
        this.currentTextIndex = index % this._lowerThirdsData.length;
        this.prepareNextLowerThirds();
    }
    prepareNextLowerThirds() {
        const lowerThirdsUploadedPromise = new Promise(resolve => {
            const inner = async () => {
                const lowerThirdsOptions = this._lowerThirdsData[this.currentTextIndex];
                const imageBuffer = await render(lowerThirdsOptions);
                const result = await this.atemConsole.uploadStill(config_json_1.default.lowerThirds.mediaIndex, imageBuffer, lowerThirdsOptions.title, lowerThirdsOptions.subtitle);
                console.log(result.state === enums_1.TransferState.Finished);
            };
            inner().then(resolve).catch(console.error);
        });
    }
    setLowerThirds(lowerThirdsData) {
        console.log(this._lowerThirdsData);
        this._lowerThirdsData = lowerThirdsData;
        console.log(this._lowerThirdsData);
        this.setLowerThirdsIndex(0);
    }
}
exports.LowerThirdsManager = LowerThirdsManager;
const getLowerThirdsHandlers = (lowerThirdsManager) => {
    let lastMacroIndex = -1;
    const handleMacros = (atemConsole, eventType, state, paths) => {
        paths.forEach(async (path) => {
            if (path.startsWith("macro.macroPlayer")) {
                console.log(path);
                const macroState = state.macro.macroPlayer;
                const { macroIndex, isRunning } = macroState;
                console.log(macroState);
                if (macroIndex === config_json_1.default.lowerThirds.macroIndex && isRunning) {
                    console.log("Macro started");
                    console.log("-----------------------------------------------");
                    lastMacroIndex = macroIndex;
                }
                else if (lastMacroIndex === config_json_1.default.lowerThirds.macroIndex && !isRunning) {
                    lastMacroIndex = -1;
                    console.log("Macro ended");
                    lowerThirdsManager.nextLowerThirds();
                }
            }
        });
    };
    return {
        connected: [() => lowerThirdsManager.setLowerThirdsIndex(0)],
        stateChanged: [handleMacros],
        error: [],
        info: [],
    };
};
exports.getLowerThirdsHandlers = getLowerThirdsHandlers;
//# sourceMappingURL=index.js.map