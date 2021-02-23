import { Atem, AtemState } from "atem-connection";
import { AtemEvent, EventType, MessageType } from "../types/enums";
import { AtemEventHandlers, Channel, ChannelStateMessage } from "../types/comm";
import { InputChannel } from "atem-connection/dist/state/input";
import equal from "deep-equal";
import config from "../../config.json";
import { LowerThirdsManager } from "../lowerthirds";
import { MyWebSocketServer } from "../wss";

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

const getMixEffectHandlers = (webSocketServer: MyWebSocketServer, lowerThirdsManager: LowerThirdsManager): AtemEventHandlers => {
    let lastChannelState: ChannelStateMessage;
    let lastMacroState: AtemState["macro"]["macroPlayer"];

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
                        console.log("Macro key pressed");
                        await atemConsole.changePreviewInput(lastChannelState.preview.index);
                        await atemConsole.macroRun(config.lowerThirds.macroIndex);
                    }
                }
            }
        });
    };

    return {
        connected: [onAtemConnected],
        stateChanged: [handleMixEffectKeyPresses],
        info: [],
        error: [],
    } as AtemEventHandlers;
};

export { getChannelState, getMixEffectHandlers };
