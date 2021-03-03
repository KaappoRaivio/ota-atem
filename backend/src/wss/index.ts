import WebSocket from "ws";
import { ChannelStateMessage, MediaStateMessage, Message } from "../types/comm";

class MyWebSocketServer {
    private wss: WebSocket.Server;
    private channelState: ChannelStateMessage;
    private mediaState: MediaStateMessage;
    constructor() {
        this.wss = new WebSocket.Server({
            port: 7634,
        });
        this.wss.on("connection", (ws: WebSocket) => {
            ws.send(JSON.stringify(this.channelState));
            ws.send(JSON.stringify(this.mediaState));
        });
    }
    public broadcastWsMessage(message: Message) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    public setChannelState(message: ChannelStateMessage) {
        this.channelState = message;
    }

    public setMediaState(message: MediaStateMessage) {
        this.mediaState = message;
    }

    public updateChannelState(newChannelState: ChannelStateMessage) {}
}

export { MyWebSocketServer };
