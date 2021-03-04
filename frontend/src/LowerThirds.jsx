import React, { useState } from "react";

import { IS_DEVELOPMENT_ENVIRONMENT, API_ENDPOINT } from "./index";
import { useRequest } from "./useRequest.js";
import LowerThirdsList from "./LowerThirdsList";
import Media from "./Media";
import { useCommunication, useQuery } from "./TallyLanding";
import { useLocation } from "react-router-dom";

const LowerThirds = props => {
    const params = useQuery();

    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || window.location.hostname);
    const { connected, state, error } = useCommunication(serverAddress, json => json.type === "media");
    return <Media state={state} serverAddress={serverAddress} />;
};

LowerThirds.propTypes = {};

export default LowerThirds;
