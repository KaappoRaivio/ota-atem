import React, { useEffect, useState } from "react";

import styles from "./App.module.css";
import Tally from "./Tally.jsx";

import { Route, Switch, useLocation, useHistory, Redirect } from "react-router-dom";
import Welcome from "./Welcome.jsx";

const useCommunication = atemIP => {
    const [state, setState] = useState({});
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(atemIP);

        try {
            const socket = new WebSocket(`ws://${atemIP}:7634/`);
            socket.onmessage = event => {
                console.log(event.data);
                if (connecting) {
                    setConnecting(false);
                }
                setState(JSON.parse(event.data));
            };
            socket.onerror = setError;
        } catch (err) {
            setError(err);
        }
    }, [atemIP]);

    useEffect(() => {
        console.log(state);
    }, [state]);

    return { connecting, state, error };
};

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const App = props => {
    const params = useQuery();

    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || "192.168.10.101");
    const [camera, setCamera] = useState(parseInt(params.get("camera")) || 0);

    const { connecting, state, error } = useCommunication(serverAddress);

    console.log(serverAddress, camera);
    const [settingsOpen, setSettingsOpen] = useState(params.get("serverAddress") == null || params.get("camera") == null);

    const history = useHistory();
    useEffect(() => {
        history.push(`?camera=${camera}&serverAddress=${serverAddress}`);
    }, [camera, serverAddress]);

    if (settingsOpen) {
        return (
            <Welcome
                initialValues={{ serverAddress, camera }}
                onSubmit={({ serverAddress, camera }) => {
                    setServerAddress(serverAddress);
                    setCamera(camera);
                    setSettingsOpen(false);
                }}
            />
        );
    } else {
        return (
            <div className={styles.parent}>
                <Tally state={state} index={camera} />
            </div>
        );
    }
};

App.propTypes = {};

export default App;
