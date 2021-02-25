import { useEffect, useState } from "react";

export const useRequest = url => {
    const [waiting, setWaiting] = useState(true);
    const [response, setResponse] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        fetch(url)
            .then(res => {
                console.log(res);
                return res.json();
            })
            .then(json => {
                setResponse(json);
                setWaiting(false);
            });
    }, [url]);

    return { waiting, response, url };
};
