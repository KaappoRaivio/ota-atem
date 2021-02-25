import React from "react";

import { IS_DEVELOPMENT_ENVIRONMENT, API_ENDPOINT } from "./index";
import { useRequest } from "./useRequest.js";
import LowerThirdsList from "./LowerThirdsList";

const LowerThirds = props => {
    const { waiting, response, error } = useRequest(`${API_ENDPOINT}/getLowerThirds`);
    // const [data, setData] = useState();
    // useEffect(() => {
    //     setData(data);
    // });

    return (
        <div>
            {!waiting ? (
                <div style={{ padding: "2%" }}>
                    <LowerThirdsList lowerThirds={response} />
                </div>
            ) : (
                "waiting"
            )}
        </div>
    );
};

LowerThirds.propTypes = {};

export default LowerThirds;
