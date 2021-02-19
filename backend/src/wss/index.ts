import WebSocket from "ws";
import { ChannelStateMessage, Message } from "../types/comm";

class MyWebSocketServer {
    private wss: WebSocket.Server;
    private channelState: ChannelStateMessage;
    constructor() {
        this.wss = new WebSocket.Server({
            port: 7634,
        });
        this.wss.on("connection", (ws: WebSocket) => {
            ws.send(JSON.stringify(this.channelState));
        });
    }
    public broadcastWsMessage(message: ChannelStateMessage) {
        this.channelState = message;
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    public updateChannelState(newChannelState: ChannelStateMessage) {}
}

export { MyWebSocketServer };
