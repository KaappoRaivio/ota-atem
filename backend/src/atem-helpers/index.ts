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
        inTransition: mixEffect.transitionPreview,
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
        console.log("Works!");
        lastChannelState = getChannelState(atemConsole.state);
        lastMacroState = atemConsole.state.macro.macroPlayer;
        webSocketServer.broadcastWsMessage(lastChannelState);
    };

    const handleMixEffectKeyPresses = (atemConsole: Atem, eventType: AtemEvent, state: AtemState, paths: string[]) => {
        paths.forEach(async path => {
            if (path.startsWith("video.ME.0")) {
                const currentChannelState = getChannelState(state);

                if (!equal(lastChannelState, currentChannelState)) {
                    if (currentChannelState.preview.index === config.lowerThirds.previewKeyIndex) {
                        console.log("Macro key pressed");
                        await atemConsole.changePreviewInput(lastChannelState.preview.index);
                        await atemConsole.macroRun(config.lowerThirds.macroIndex);
                    } else {
                        webSocketServer.broadcastWsMessage(currentChannelState);
                        lastChannelState = currentChannelState;
                    }
                }
            }
        });
    };
    let lastMacroIndex: number = -1;
    const handleMacros = (atemConsole: Atem, eventType: AtemEvent, state: AtemState, paths: string[]) => {
        paths.forEach(async path => {
            if (path.startsWith("macro.macroPlayer")) {
                console.log(path);
                const macroState = state.macro.macroPlayer;
                const { macroIndex, isRunning } = macroState;
                console.log(macroState);

                if (macroIndex === config.lowerThirds.macroIndex && isRunning) {
                    console.log("Macro started");
                    console.log("-----------------------------------------------");
                    lastMacroIndex = macroIndex;
                } else if (lastMacroIndex === config.lowerThirds.macroIndex && !isRunning) {
                    lastMacroIndex = -1;
                    console.log("Macro ended");

                    lowerThirdsManager.nextLowerThirds();
                }
            }
        });
    };
    return {
        connected: [onAtemConnected],
        stateChanged: [handleMixEffectKeyPresses, handleMacros],
        info: [],
        error: [],
    } as AtemEventHandlers;
};

export { getChannelState, getMixEffectHandlers };
