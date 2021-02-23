import { MediaControlRequest } from "mediaControlRequest";
import { Atem, AtemState } from "atem-connection";
import { validateMediaControlRequest, validateMediaPreparationRequest } from "./validators";
import config from "../config.json";
import lowerThirdsTexts from "../lowerthirds.json";
import express from "express";
import { getLowerThirdsHandlers, LowerThirdsManager } from "./lowerthirds";
import { getMixEffectHandlers } from "./atem-helpers";
import { AtemEventDispatcher } from "./atem-eventdispatcher";
import { MyWebSocketServer } from "./wss";
import { MediaPreparationRequest } from "mediaPreparationRequest";
import { LowerThirdsOptions } from "lowerThirdsOptions";
import bodyParser from "body-parser";
import { AtemEvent } from "enums";

const app = express();
app.use(bodyParser.json());

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
atemEventDispatcher.addHandlers(getLowerThirdsHandlers(lowerThirdsManager));

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

app.post("/prepareLowerThirds", async (req, res) => {
    console.log("request");
    // console.log(req.body);
    if (validateMediaPreparationRequest(req.body)) {
        res.sendStatus(200);
        const mediaPreparationRequest: LowerThirdsOptions[] = req.body.lowerThirdsList;
        console.log(mediaPreparationRequest);
        lowerThirdsManager.setLowerThirds(mediaPreparationRequest);
    } else {
        res.sendStatus(400);
    }
});

app.listen(4000, () => {
    console.log("Listening");
});
