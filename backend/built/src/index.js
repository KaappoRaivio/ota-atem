import { Atem } from "atem-connection";
import { validateMediaControlRequest, validateMediaPreparationRequest } from "./validators.js";
import config from "../config.json";
import lowerThirdsTexts from "../lowerthirds.json";
import express from "express";
import { getLowerThirdsHandlers, LowerThirdsManager } from "./lowerthirds/index.js";
import { getMixEffectHandlers } from "./atem-helpers/index.js";
import { AtemEventDispatcher } from "./atem-eventdispatcher/index.js";
import { MyWebSocketServer } from "./wss/index.js";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());
const webSocketServer = new MyWebSocketServer();
const atemConsole = new Atem();
const atemEventDispatcher = new AtemEventDispatcher(atemConsole, {
    connected: [],
    error: [],
    info: [],
    stateChanged: [],
});
const lowerThirdsManager = new LowerThirdsManager(lowerThirdsTexts, atemConsole);
atemEventDispatcher.addHandlers(getMixEffectHandlers(webSocketServer, lowerThirdsManager));
atemEventDispatcher.addHandlers(getLowerThirdsHandlers(lowerThirdsManager));
atemConsole.connect(config.atem.ip);
app.post("/controlMedia", async (req, res) => {
    if (validateMediaControlRequest(req.body)) {
        const mediaControlRequest = req.body;
        const { action } = mediaControlRequest;
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }
});
app.post("/prepareLowerThirds", async (req, res) => {
    console.log("request");
    // console.log(req.body);
    if (validateMediaPreparationRequest(req.body)) {
        res.sendStatus(200);
        const mediaPreparationRequest = req.body.lowerThirdsList;
        console.log(mediaPreparationRequest);
        lowerThirdsManager.setLowerThirds(mediaPreparationRequest);
    }
    else {
        res.sendStatus(400);
    }
});
export default app;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    app.listen(4000, () => {
        console.log("Listening");
    });
}
//# sourceMappingURL=index.js.map