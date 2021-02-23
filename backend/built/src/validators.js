import Ajv from "ajv";
import mediaControlRequestSchema from "./schemas/mediaControlRequest.json";
import mediaPreparationRequestSchema from "./schemas/mediaPreparationRequest.json";
const ajv = new Ajv();
export const validateMediaControlRequest = ajv.compile(mediaControlRequestSchema);
export const validateMediaPreparationRequest = ajv.compile(mediaPreparationRequestSchema);
//# sourceMappingURL=validators.js.map