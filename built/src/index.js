"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atem_connection_1 = require("atem-connection");
const validators_1 = require("./validators");
const config_json_1 = __importDefault(require("../config.json"));
const lowerthirds_json_1 = __importDefault(require("../lowerthirds.json"));
const express_1 = __importDefault(require("express"));
const lowerthirds_1 = require("./lowerthirds");
const atem_helpers_1 = require("./atem-helpers");
const atem_eventdispatcher_1 = require("./atem-eventdispatcher");
const wss_1 = require("./wss");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(cors_1.default());
const webSocketServer = new wss_1.MyWebSocketServer();
const atemConsole = new atem_connection_1.Atem();
const atemEventDispatcher = new atem_eventdispatcher_1.AtemEventDispatcher(atemConsole, {
    connected: [],
    error: [],
    info: [],
    stateChanged: [],
});
const lowerThirdsManager = new lowerthirds_1.LowerThirdsManager(lowerthirds_json_1.default, atemConsole);
atemEventDispatcher.addHandlers(atem_helpers_1.getMixEffectHandlers(webSocketServer, lowerThirdsManager));
atemEventDispatcher.addHandlers(lowerthirds_1.getLowerThirdsHandlers(lowerThirdsManager));
atemConsole.connect(config_json_1.default.atem.ip);
app.post("/controlMedia", async (req, res) => {
    if (validators_1.validateMediaControlRequest(req.body)) {
        const mediaControlRequest = req.body;
        const { action } = mediaControlRequest;
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }
});
app.post("/prepareLowerThirds", async (req, res) => {
    console.log("request");
    if (validators_1.validateMediaPreparationRequest(req.body)) {
        res.sendStatus(200);
        const mediaPreparationRequest = req.body.lowerThirdsList;
        console.log(mediaPreparationRequest);
        lowerThirdsManager.setLowerThirds(mediaPreparationRequest);
    }
    else {
        res.sendStatus(400);
    }
});
app.get("/getLowerThirds", async (req, res) => {
    res.status(200).json(lowerThirdsManager.lowerThirdsData);
});
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    app.listen(4000, () => {
        console.log("Started development server");
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map