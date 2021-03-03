import { Atem, AtemState } from "atem-connection";
import { AtemEvent, EventType, MessageType } from "../types/enums";
import { AtemEventHandlers, Channel, ChannelStateMessage } from "../types/comm";
import { InputChannel } from "atem-connection/dist/state/input";
import equal from "deep-equal";
import config from "../../config.json";
import { LowerThirdsManager } from "../lowerthirds";
import { MyWebSocketServer } from "../wss";
import { logger } from "handlebars";

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getChannelState(state: AtemState) {
    const mixEffect = state.video.mixEffects[0];
    const inputChannels = state.inputs;
    const programChannel = formatAtemInput(inputChannels[mixEffect.programInput]);
    const previewChannel = formatAtemInput(inputChannels[mixEffect.previewInput]);

    return {
        type: MessageType.Event,
        event: EventType.ChannelStateChange,
        program: programChannel,
        preview: previewChannel,
        inTransition: mixEffect.transitionPosition.inTransition,
    } as ChannelStateMessage;
}

function formatAtemInput(atemChannel: InputChannel) {
    return {
        index: atemChannel.inputId,
        longName: atemChannel.longName,
        shortName: atemChannel.shortName,
    } as Channel;
}

async function runLowerThirds(atemConsole: Atem) {
    console.log("Start macro");
    await atemConsole.setTransitionStyle({
        nextSelection: 2,
    });
    await atemConsole.autoTransition();
    await timeout(3000);
    await atemConsole.autoTransition();
    await atemConsole.setTransitionStyle({
        nextSelection: 1,
    });
    console.log("End macro");
}

const getMixEffectHandlers = (webSocketServer: MyWebSocketServer, lowerThirdsManager: LowerThirdsManager): AtemEventHandlers => {
    let lastChannelState: ChannelStateMessage;
    let lastMacroState: AtemState["macro"]["macroPlayer"];
    let isMacroRunning: boolean = false;

    const onAtemConnected = (atemConsole: Atem) => {
        console.log("Atem connected");
        lastChannelState = getChannelState(atemConsole.state);
        lastMacroState = atemConsole.state.macro.macroPlayer;
        webSocketServer.broadcastWsMessage(lastChannelState);
    };

    const handleMixEffectKeyPresses = (atemConsole: Atem, eventType: AtemEvent, state: AtemState, paths: string[]) => {
        paths.forEach(async path => {
            if (path.startsWith("video.ME.0")) {
                const currentChannelState = getChannelState(state);

                if (!equal(lastChannelState, currentChannelState)) {
                    if (currentChannelState.preview.index !== config.lowerThirds.previewKeyIndex) {
                        webSocketServer.broadcastWsMessage(currentChannelState);
                        lastChannelState = currentChannelState;
                    }
                }
            }
        });
        paths.forEach(async path => {
            if (path.startsWith("video.ME.0")) {
                const currentChannelState = getChannelState(state);

                if (!equal(lastChannelState, currentChannelState)) {
                    if (currentChannelState.preview.index === config.lowerThirds.previewKeyIndex) {
                        await atemConsole.changePreviewInput(lastChannelState.preview.index);
                        if (!isMacroRunning) {
                            isMacroRunning = true;
                            runLowerThirds(atemConsole).then(() => {
                                isMacroRunning = false;
                            });
                        }
                    }
                }
            }
        });
    };

    const loggerFunc = (atemConsole: Atem, eventType: AtemEvent, state: AtemState, paths: string[]) => {
        paths.forEach(async path => {
            if (path.startsWith("video.ME.0.transitionProperties")) {
                console.log(state.video.mixEffects[0].transitionProperties);
            }
        });
    };

    return {
        connected: [onAtemConnected],
        stateChanged: [handleMixEffectKeyPresses, loggerFunc],
        info: [],
        error: [],
    } as AtemEventHandlers;
};

export { getChannelState, getMixEffectHandlers };
