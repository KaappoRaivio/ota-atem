import React, { useEffect, useState } from "react";

import styles from "./App.module.css";
import Tally from "./Tally.jsx";

import { useHistory, useLocation } from "react-router-dom";
import Welcome from "./Welcome.jsx";

const useCommunication = atemIP => {
    const [state, setState] = useState({});
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(atemIP);

        const initializeSocket = () => {
            try {
                const socket = new WebSocket(`ws://${atemIP}:7634/`);
                socket.onmessage = event => {
                    if (connecting) {
                        setConnecting(false);
                    }
                    setState(JSON.parse(event.data));
                };
                socket.onerror = setError;
            } catch (err) {
                setTimeout(initializeSocket, 100);
            }
        };

        initializeSocket();
    }, [atemIP]);

    return { connecting, state, error };
};

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const App = props => {
    const params = useQuery();

    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || window.location.hostname);
    const [camera, setCamera] = useState(parseInt(params.get("camera")) || 1);

    const { connecting, state, error } = useCommunication(serverAddress);
    const [settingsOpen, setSettingsOpen] = useState(params.get("settingsOpen") === "true");

    const history = useHistory();
    useEffect(() => {
        history.push(`?camera=${camera}&serverAddress=${serverAddress}&settingsOpen=${settingsOpen}`);
    }, [camera, serverAddress, settingsOpen]);
    if (settingsOpen) {
        return (
            <Welcome
                initialValues={{ serverAddress, camera }}
                onSubmit={({ serverAddress, camera }) => {
                    setServerAddress(serverAddress);
                    setCamera(parseInt(camera));
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
