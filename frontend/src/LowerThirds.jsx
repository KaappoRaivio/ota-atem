import React from "react";

import { IS_DEVELOPMENT_ENVIRONMENT, API_ENDPOINT } from "./index";
import { useRequest } from "./useRequest.js";
import LowerThirdsList from "./LowerThirdsList";
import Media from "./Media";
import { useCommunication } from "./TallyLanding";

const LowerThirds = ({ serverAddress }) => {
    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || window.location.hostname);
    const { connected, state, error } = useCommunication(serverAddress, json => json.type === "media");
    return <Media state={state} serverAddress={serverAddress} />;
};

LowerThirds.propTypes = {};

export default LowerThirds;
