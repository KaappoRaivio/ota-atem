import { LowerThirdsOptions } from "../types/lowerThirdsOptions";
import nodeHtmlToImage from "node-html-to-image";
import fs from "fs";

const template = fs.readFileSync("./lowerthirds.html.template", {
    encoding: "utf-8",
});
async function render(lowerThirdsOptions: LowerThirdsOptions) {
    const imageBuffer = await nodeHtmlToImage({
        html: template,
        content: {
            title: lowerThirdsOptions.title,
            subtitle: lowerThirdsOptions.subtitle,
        },
    });
    return imageBuffer as Buffer;
}

export { render };
