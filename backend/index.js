import { Atem } from "atem-connection";
import WebSocket from "ws";
import config from "config.json";

const atemConsole = new Atem();

const wss = new WebSocket.Server({
  port: 7634,
});

atemConsole.connect(config.atem.ip);

atem.onStateChange("stateChanged", (state, path) => {
  if (path.startsWith("video.ME.0")) {
    const mixEffect = state.video.mixEffects[0];
    const inputChannels = state.inputs;
    const programChannel = inputChannels[mixEffect.programInput];
    const previewChannel = inputChannels[mixEffect.previewInput];
    const stateMessage = JSON.stringify(formatState(programChannel, previewChannel));
    broadcastWsMessage(stateMessage);
  }
});

function formatState(programChannel, previewChannel) {
  return {
    program: {
      id: programChannel.inputId,
      shortName: programChannel.shortName,
      longName: programChannel.longName,
    },
    preview: {
      id: previewChannel.inputId,
      shortName: previewChannel.shortName,
      longName: previewChannel.longName,
    },
  };
}

function broadcastWsMessage(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
