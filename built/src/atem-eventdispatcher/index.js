"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtemEventDispatcher = void 0;
const atem_connection_1 = require("atem-connection");
const enums_1 = require("../types/enums");
class AtemEventDispatcher {
    constructor(atemConsole, handlers) {
        this.atemConsole = atemConsole;
        this.registerHandlers(handlers);
    }
    registerHandlers(handlers) {
        var _a, _b, _c, _d;
        (_a = handlers.connected) === null || _a === void 0 ? void 0 : _a.forEach(handler => {
            this.atemConsole.on(enums_1.AtemEvent.connected, () => {
                handlers.connected.forEach(handler => handler(this.atemConsole, enums_1.AtemEvent.connected));
            });
        });
        (_b = handlers.stateChanged) === null || _b === void 0 ? void 0 : _b.forEach(handler => {
            this.atemConsole.on(enums_1.AtemEvent.stateChanged, (state, paths) => {
                handlers.stateChanged.forEach(handler => handler(this.atemConsole, enums_1.AtemEvent.stateChanged, state, paths));
            });
        });
        (_c = handlers.error) === null || _c === void 0 ? void 0 : _c.forEach(handler => {
            this.atemConsole.on(enums_1.AtemEvent.error, error => {
                handlers.error.forEach(handler => handler(this.atemConsole, enums_1.AtemEvent.error, error));
            });
        });
        (_d = handlers.info) === null || _d === void 0 ? void 0 : _d.forEach(handler => {
            this.atemConsole.on(enums_1.AtemEvent.info, info => {
                var _a;
                (_a = handlers.info) === null || _a === void 0 ? void 0 : _a.forEach(handler => handler(this.atemConsole, enums_1.AtemEvent.info, info));
            });
        });
    }
    addHandlers(newEffectHandlers) {
        this.registerHandlers(newEffectHandlers);
        if (this.atemConsole.status === atem_connection_1.AtemConnectionStatus.CONNECTED) {
            newEffectHandlers.connected.forEach(handler => handler(this.atemConsole, enums_1.AtemEvent.connected));
        }
    }
}
exports.AtemEventDispatcher = AtemEventDispatcher;
//# sourceMappingURL=index.js.map