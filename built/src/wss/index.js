"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWebSocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
class MyWebSocketServer {
    constructor() {
        this.wss = new ws_1.default.Server({
            port: 7634,
        });
        this.wss.on("connection", (ws) => {
            ws.send(JSON.stringify(this.channelState));
        });
    }
    broadcastWsMessage(message) {
        this.channelState = message;
        this.wss.clients.forEach(client => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    updateChannelState(newChannelState) { }
}
exports.MyWebSocketServer = MyWebSocketServer;
//# sourceMappingURL=index.js.map