"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMediaPreparationRequest = exports.validateMediaControlRequest = void 0;
const ajv_1 = __importDefault(require("ajv"));
const mediaControlRequest_json_1 = __importDefault(require("./schemas/mediaControlRequest.json"));
const mediaPreparationRequest_json_1 = __importDefault(require("./schemas/mediaPreparationRequest.json"));
const ajv = new ajv_1.default();
exports.validateMediaControlRequest = ajv.compile(mediaControlRequest_json_1.default);
exports.validateMediaPreparationRequest = ajv.compile(mediaPreparationRequest_json_1.default);
//# sourceMappingURL=validators.js.map