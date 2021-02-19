import { MediaControlRequest } from "mediaControlRequest";
import { AtemEvent } from "./types/enums";
import { Atem } from "atem-connection";
import { validateMediaControlRequest } from "./validators";
import config from "../config.json";
import lowerThirdsTexts from "../lowerthirds.json";
import express from "express";
import { LowerThirdsManager } from "./lowerthirds";
import { getMixEffectHandlers } from "./atem-helpers";
import { AtemEventDispatcher } from "./atem-eventdispatcher";
import { MyWebSocketServer } from "./wss";
import { AtemEventHandlers } from "comm";

const app = express();
const webSocketServer: MyWebSocketServer = new MyWebSocketServer();

const atemConsole = new Atem();
const atemEventDispatcher: AtemEventDispatcher = new AtemEventDispatcher(atemConsole, {
    connected: [],
    error: [],
    info: [],
    stateChanged: [],
});

const lowerThirdsManager: LowerThirdsManager = new LowerThirdsManager(lowerThirdsTexts, atemConsole);
atemEventDispatcher.addHandlers(getMixEffectHandlers(webSocketServer, lowerThirdsManager));
atemEventDispatcher.addHandlers({ error: [], info: [], stateChanged: [], connected: [() => lowerThirdsManager.setLowerThirdsIndex(0)] });
atemConsole.connect(config.atem.ip);

app.post("/controlMedia", async (req, res) => {
    if (validateMediaControlRequest(req.body)) {
        const mediaControlRequest: MediaControlRequest = req.body;
        const { action } = mediaControlRequest;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

app.listen(4000, () => {
    console.log("Listening");
});
