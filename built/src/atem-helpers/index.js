"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMixEffectHandlers = exports.getChannelState = void 0;
const enums_1 = require("../types/enums");
const deep_equal_1 = __importDefault(require("deep-equal"));
const config_json_1 = __importDefault(require("../../config.json"));
function getChannelState(state) {
    const mixEffect = state.video.mixEffects[0];
    const inputChannels = state.inputs;
    const programChannel = formatAtemInput(inputChannels[mixEffect.programInput]);
    const previewChannel = formatAtemInput(inputChannels[mixEffect.previewInput]);
    return {
        type: enums_1.MessageType.Event,
        event: enums_1.EventType.ChannelStateChange,
        program: programChannel,
        preview: previewChannel,
        inTransition: mixEffect.transitionPosition.inTransition,
    };
}
exports.getChannelState = getChannelState;
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
                if (!deep_equal_1.default(lastChannelState, currentChannelState)) {
                    if (currentChannelState.preview.index !== config_json_1.default.lowerThirds.previewKeyIndex) {
                        webSocketServer.broadcastWsMessage(currentChannelState);
                        lastChannelState = currentChannelState;
                    }
                }
            }
        });
        paths.forEach(async (path) => {
            if (path.startsWith("video.ME.0")) {
                const currentChannelState = getChannelState(state);
                if (!deep_equal_1.default(lastChannelState, currentChannelState)) {
                    if (currentChannelState.preview.index === config_json_1.default.lowerThirds.previewKeyIndex) {
                        console.log("Macro key pressed");
                        await atemConsole.changePreviewInput(lastChannelState.preview.index);
                        await atemConsole.macroRun(config_json_1.default.lowerThirds.macroIndex);
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
exports.getMixEffectHandlers = getMixEffectHandlers;
//# sourceMappingURL=index.js.map