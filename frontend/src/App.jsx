import React, { useEffect, useState } from "react";

import styles from "./App.module.css";
import Tally from "./Tally.jsx";

import { useHistory, useLocation } from "react-router-dom";
import Welcome from "./Welcome.jsx";

const useCommunication = atemIP => {
    const [state, setState] = useState({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(atemIP);

        const initializeSocket = () => {
            try {
                console.log("Creating new socket");
                const socket = new WebSocket(`ws://${atemIP}:7634/`);
                console.log("Created");
                socket.onmessage = event => {
                    console.log(event.data);
                    setState(JSON.parse(event.data));
                };
                socket.onerror = e => {
                    console.log("Socket error!");
                    // setConnected(false);
                    // setTimeout(initializeSocket, 100);
                };
                socket.onclose = () => {
                    console.log("Socket closed!");
                    setConnected(false);
                    setTimeout(initializeSocket, 100);
                };
                socket.onopen = () => {
                    console.log("Socket open!");
                    setConnected(true);
                };
            } catch (err) {
                console.log("Probably refused connection");
                setTimeout(initializeSocket, 100);
            }
        };

        initializeSocket();
    }, [atemIP]);

    return { connected, state, error };
};

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const App = props => {
    const params = useQuery();

    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || window.location.hostname);
    const [camera, setCamera] = useState(parseInt(params.get("camera")) || 1);

    const { connected, state, error } = useCommunication(serverAddress);
    const [settingsOpen, setSettingsOpen] = useState(params.get("settingsOpen") !== "false");

    const history = useHistory();
    useEffect(() => {
        history.push(`?camera=${camera}&serverAddress=${serverAddress}&settingsOpen=${settingsOpen}`);
    }, [camera, serverAddress, settingsOpen]);

    useEffect(() => {
        console.log("Connected: ", connected);
    }, [connected]);
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
            <>
                <div className={styles.parent}>
                    <Tally connected={connected} state={state} index={camera} />
                    <div className={styles.backoverlay}>
                        <button onDoubleClick={() => setSettingsOpen(true)}>settings</button>
                    </div>
                </div>
            </>
        );
    }
};

App.propTypes = {};

export default App;
