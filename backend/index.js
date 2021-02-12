import AtemPKG from "atem-connection";
const { Atem } = AtemPKG;
import WebSocket from "ws";
//import config from "./config.json";

const atemConsole = new Atem();

const wss = new WebSocket.Server({
  port: 7634,
});

let lastState;

// atemConsole.connect(config.atem.ip);
atemConsole.connect("192.168.10.240");

atemConsole.on("stateChanged", (state, paths) => {
  paths.forEach(path => {
    if (path.startsWith("video.ME.0")) {
      const mixEffect = state.video.mixEffects[0];
      console.log(state.video.mixEffects);
      const inputChannels = state.inputs;
      const programChannel = inputChannels[mixEffect.programInput];
      const previewChannel = inputChannels[mixEffect.previewInput];
      const formattedState = formatState(programChannel, previewChannel);
      const data = JSON.stringify(formattedState);
      broadcastWsMessage(data);
      return;
    }
  });
});

function formatState(programChannel, previewChannel) {
  return {
    program: {
      index: programChannel.inputId,
      shortName: programChannel.shortName,
      longName: programChannel.longName,
    },
    preview: {
      index: previewChannel.inputId,
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
/*
const testProgram = {
  inputId: 3,
  shortName: "päivää",
  longName: "päivää päivää päivää",
};

const testPreview = {
  inputId: 4,
  shortName: "preview",
  longName: "preview päivää päivää",
};

setInterval(() => {
  const msg = JSON.stringify(formatState(testProgram, testPreview));
  broadcastWsMessage(msg);
}, 2000);
*/
