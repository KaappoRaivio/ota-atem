import { LowerThirdsOptions } from "../types/lowerThirdsOptions";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import sharp from "sharp";

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

export { render };
