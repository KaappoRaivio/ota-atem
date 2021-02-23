import { EventType, MessageType } from "../types/enums";
import equal from "deep-equal";
import config from "../../config.json";
function getChannelState(state) {
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
    };
}
function formatAtemInput(atemChannel) {
    return {
        index: atemChannel.inputId,
        longName: atemChannel.longName,
        shortName: atemChannel.shortName,
    };
}
const getMixEffectHandlers = (webSocketServer, lowerThirdsManager) => {
    let lastChannelState;
    let lastMacroState;
    const onAtemConnected = (atemConsole) => {
        console.log("Atem connected");
        lastChannelState = getChannelState(atemConsole.state);
        lastMacroState = atemConsole.state.macro.macroPlayer;
        webSocketServer.broadcastWsMessage(lastChannelState);
    };
    const handleMixEffectKeyPresses = (atemConsole, eventType, state, paths) => {
        paths.forEach(async (path) => {
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
        paths.forEach(async (path) => {
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
    };
};
export { getChannelState, getMixEffectHandlers };
//# sourceMappingURL=index.js.map