import { LowerThirdsOptions } from "./types/lowerThirdsOptions";
import { MediaControlRequest } from "./types/mediaControlRequest.d";
import { MessageType, EventType } from "./types/enums";
import { Channel, ChannelStateMessage, Message } from "./types/comm";
import { InputChannel } from "atem-connection/dist/state/input";
import { Atem, AtemState } from "atem-connection";
import { ValidateMediaControlRequest } from "./validators";
import WebSocket from "ws";
import config from "../config.json";
import lowerThirdsTexts from "../lowerthirds.json";
import equal from "deep-equal";
import express from "express";
import * as lowerThirds from "./lowerThirds";

const app = express();

const atemConsole = new Atem();

const wss = new WebSocket.Server({
    port: 7634,
});

let lastState: ChannelStateMessage;
let lastMacroState: AtemState["macro"]["macroPlayer"];

let currentLowerThirdsIndex: number = 0;

let lowerThirdsUploadedPromise: Promise<void>;

atemConsole.connect(config.atem.ip);

atemConsole.on("error", err => {
    console.error(err);
});

atemConsole.on("info", info => {
    console.log(info);
});

// init laststate & lastmacrostate
atemConsole.on("connected", () => {
    lastState = getChannelState(atemConsole.state);
    lastMacroState = atemConsole.state.macro.macroPlayer;
    broadcastWsMessage(lastState);
});

atemConsole.on("stateChanged", (state: AtemState, paths: string[]) => {
    paths.forEach(async path => {
        if (path.startsWith("video.ME.0")) {
            const message = getChannelState(state);
            // check if state changed
            if (!equal(lastState, message)) {
                console.log(message);
                // check macro
                if (message.preview.index === 8) {
                    await lowerThirdsUploadedPromise;
                    await atemConsole.changePreviewInput(lastState.preview.index);
                    await atemConsole.macroRun(config.lowerThirds.macroIndex);
                } else {
                    // broadcast new state if macro not run
                    broadcastWsMessage(message);
                    lastState = message;
                }
            }
        }
        // has macro ended
        if (path.startsWith("macro.macroPlayer")) {
            const macroState = state.macro.macroPlayer;

            if (lastMacroState === undefined) lastMacroState = macroState;
            // has the macrostate changed
            if (!equal(lastMacroState, macroState)) {
                if (lastMacroState.isRunning && lastMacroState.macroIndex === config.lowerThirds.macroIndex) {
                    // Was our macro still running in the last state
                    // Is the current running macro not our macro or is the macro player stopped
                    if (macroState.macroIndex !== config.lowerThirds.macroIndex || !macroState.isRunning) {
                        console.log("Next lower third, macro has ended");
                        nextLowerThirds();
                        uploadCurrentLowerThirds();
                    }
                }
            }
        }
    });
});

function nextLowerThirds() {
    if (currentLowerThirdsIndex + 1 < lowerThirdsTexts.length) {
        currentLowerThirdsIndex++;
    } else {
        currentLowerThirdsIndex = 0;
    }
}

function setLowerThirds(index: number) {
    if (index >= 0 && index < lowerThirdsTexts.length) {
        currentLowerThirdsIndex = index;
    }
}

function uploadCurrentLowerThirds() {
    lowerThirdsUploadedPromise = new Promise<void>(async res => {
        const lowerThirdsOptions = lowerThirdsTexts[currentLowerThirdsIndex];
        const imageBuffer = await lowerThirds.render(lowerThirdsOptions);
        await atemConsole.uploadStill(config.lowerThirds.mediaIndex, imageBuffer, lowerThirdsOptions.title, lowerThirdsOptions.subtitle);
        res();
    });
}

function getChannelState(state: AtemState) {
    const mixEffect = state.video.mixEffects[0];
    const inputChannels = state.inputs;
    const programChannel = formatAtemInput(inputChannels[mixEffect.programInput]);
    const previewChannel = formatAtemInput(inputChannels[mixEffect.previewInput]);

    const message = {
        type: MessageType.Event,
        event: EventType.ChannelStateChange,
        program: programChannel,
        preview: previewChannel,
        inTransition: mixEffect.transitionPreview,
    } as ChannelStateMessage;

    return message;
}

function formatAtemInput(atemChannel: InputChannel) {
    return {
        index: atemChannel.inputId,
        longName: atemChannel.longName,
        shortName: atemChannel.shortName,
    } as Channel;
}

function broadcastWsMessage(message: Message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// send message to new clients
wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify(lastState));
});

app.post("/controlMedia", async (req, res) => {
    if (ValidateMediaControlRequest(req.body)) {
        const mediaControlRequest: MediaControlRequest = req.body;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

app.listen(4000, () => {
    console.log("Listening");
});
