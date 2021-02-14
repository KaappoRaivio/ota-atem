import fs from "fs";

const HTMLTemplate: string = fs.readFileSync("./lowerthirds.html.template", "utf-8");

function substituteTemplate(string: string, symbols: Object) {
    return string.replace(/\${([^}]*)}/g, (r, k: string) => symbols[k]);
}

function getHTML(options: Object) {
    console.log(substituteTemplate(HTMLTemplate, options));
}

console.log(substituteTemplate("<div>${test}asd</div>", { test: 42 }));
