import Ajv from "ajv";
import { MediaControlRequest } from "mediaControlRequest";
import { MediaPreparationRequest } from "mediaPreparationRequest";

import mediaControlRequestSchema from "./schemas/mediaControlRequest.json";
import mediaPreparationRequestSchema from "./schemas/mediaPreparationRequest.json";
const ajv = new Ajv();

export const validateMediaControlRequest = ajv.compile<MediaControlRequest>(mediaControlRequestSchema);
export const validateMediaPreparationRequest = ajv.compile<MediaPreparationRequest>(mediaPreparationRequestSchema);
