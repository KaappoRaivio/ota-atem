import Ajv from "ajv";
import { MediaControlRequest } from "mediaControlRequest";
import mediaControlRequestSchema from "./schemas/mediaControlRequest.json";
const ajv = new Ajv();

export const ValidateMediaControlRequest = ajv.compile<MediaControlRequest>(mediaControlRequestSchema);
