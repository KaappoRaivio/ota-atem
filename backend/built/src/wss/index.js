import WebSocket from "ws";
class MyWebSocketServer {
    constructor() {
        this.wss = new WebSocket.Server({
            port: 7634,
        });
        this.wss.on("connection", (ws) => {
            ws.send(JSON.stringify(this.channelState));
        });
    }
    broadcastWsMessage(message) {
        this.channelState = message;
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    updateChannelState(newChannelState) { }
}
export { MyWebSocketServer };
//# sourceMappingURL=index.js.map