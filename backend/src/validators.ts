import Ajv from "ajv";
import { MediaControlRequest } from "mediaControlRequest";
import { MediaPreparationRequest } from "mediaPreparationRequest";
import { MediaUpdateRequest } from "mediaUpdateRequest";

import mediaControlRequestSchema from "./schemas/mediaControlRequest.json";
import mediaPreparationRequestSchema from "./schemas/mediaPreparationRequest.json";
import mediaUpdateRequestSchema from "./schemas/mediaUpdateRequest.json";
const ajv = new Ajv();

export const validateMediaControlRequest = ajv.compile<MediaControlRequest>(mediaControlRequestSchema);
export const validateMediaPreparationRequest = ajv.compile<MediaPreparationRequest>(mediaPreparationRequestSchema);
export const validateMediaUpdateRequest = ajv.compile<MediaUpdateRequest>(mediaUpdateRequestSchema);
