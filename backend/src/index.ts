import { MediaControlRequest } from "./types/mediaControlRequest.d";
import { MessageType, EventType } from "./types/enums";
import { Channel, ChannelStateMessage, Message } from "./types/comm";
import { InputChannel } from "atem-connection/dist/state/input";
import { Atem, AtemState } from "atem-connection";
import { ValidateMediaControlRequest } from "./validators";
import WebSocket from "ws";
import config from "../config.json";
import equal from "deep-equal";
import express from "express";

const app = express();

const atemConsole = new Atem();

const wss = new WebSocket.Server({
    port: 7634,
});

let lastState: ChannelStateMessage;

atemConsole.connect(config.atem.ip);

atemConsole.on("stateChanged", (state: AtemState, paths: string[]) => {
    paths.forEach(path => {
        if (path.startsWith("video.ME.0")) {
            const message = getChannelState(state);
            // check if state changed
            if (!equal(lastState, message)) {
                // check macro
                if (message.preview.index == 8) {
                    atemConsole.changePreviewInput(lastState.preview.index);
                    runMacro(config.lowerThirds.macroIndex);
                } else {
                    // broadcast new state if macro not run
                    broadcastWsMessage(message);
                    lastState = message;
                }

                return;
            }
        }
    });
});

function runMacro(index: number) {
    atemConsole.macroRun(index);
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

app.listen(3000, () => {
    console.log("Listening");
});
