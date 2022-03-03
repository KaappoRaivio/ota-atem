import React, { useEffect, useState } from "react";

import styles from "./App.module.css";
import Tally from "./Tally.jsx";
import Media from "./Media.jsx";

import { useHistory, useLocation } from "react-router-dom";
import Welcome from "./Welcome.jsx";

export const useCommunication = (serverIP, validator) => {
    const [state, setState] = useState({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(serverIP);

        const initializeSocket = () => {
            try {
                console.log("Creating new socket");
                const socket = new WebSocket(`ws://${serverIP}:7634/`);
                console.log("Created");
                socket.onmessage = event => {
                    console.log(event.data);
                    let json;
                    try {
                        json = JSON.parse(event.data);

                        if (validator(json)) {
                            setState(json);
                        }
                        // if (json.type === "tally") {
                        //     setState(json);
                        // } else if (json.type === "media") {
                        //     setMediaState(json);
                        // }
                    } catch (err) {
                        console.log("Couldn't parse: ", event.data);
                    }
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
    }, [serverIP]);

    return { connected, state, error };
};

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const TallyLanding = props => {
    const params = useQuery();

    const [serverAddress, setServerAddress] = useState(params.get("serverAddress") || window.location.hostname);
    
    let cams;
    try {
        cams = JSON.parse(params.get("cameras")) || [1,];
        if (!Array.isArray(cams)) cams = [1,];
    } catch (e) {
        cams = [1,]
    }
    console.log(cams)
    const [cameras, setCameras] = useState(cams.map(a => parseInt(a)));
console.log(cameras)
console.log(JSON.stringify(cameras))

    const { connected, state, error } = useCommunication(serverAddress, json => json.type === "tally");
    const [settingsOpen, setSettingsOpen] = useState(params.get("settingsOpen") !== "false");

    const [mediaOpen, setMediaOpen] = useState(params.get("mediaOpen") === "true");

    const history = useHistory();
    useEffect(() => {
        history.push(`/tally?cameras=${JSON.stringify(cameras)}&serverAddress=${serverAddress}&settingsOpen=${settingsOpen}&mediaOpen=${mediaOpen}`);
    }, [cameras, serverAddress, settingsOpen, mediaOpen, history]);

    useEffect(() => {
        console.log("Connected: ", connected);
    }, [connected]);
    if (settingsOpen) {
        return (
            <Welcome
                initialValues={{ serverAddress, camera: cameras }}
                onSubmit={({ serverAddress, camera }) => {
                    setServerAddress(serverAddress);
                    console.log(camera)
                    setCameras(parseInt(camera) ? [parseInt(camera)] : JSON.parse(camera));
                    setSettingsOpen(false);
                }}
            />
        );
    } else {
        return (
            <>
                <div className={styles.parent} style={{gridTemplateColumns: "1fr ".repeat(Math.min(cams.length, 4))}}>
                    {cameras.map(camera => <div className={styles.tallyWrapper}>
                        <Tally connected={connected} state={state} index={camera} />
                    </div>)}
                    
                    
                </div>
                <div className={styles.backoverlay}>
                        <button onDoubleClick={() => setSettingsOpen(true)}>settings</button>
                    </div>
            </>
        );
    }
};

TallyLanding.propTypes = {};

export default TallyLanding;
