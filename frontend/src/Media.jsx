import React, { useEffect, useState } from "react";
import styles from "./Media.module.css";

const sendIndex = (index, serverAddress) => {
    console.log(index, serverAddress);
    fetch(`http://${serverAddress}/setMediaIndex`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
    });
};

const updateLowerThirds = (index, newLowerThirds, serverAddress, action) => {
    console.log(`http://${serverAddress}/updateLowerThirds`);
    try {
        return fetch(`http://${serverAddress}/updateLowerThirds`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, index, item: JSON.parse(newLowerThirds) }),
        })
            .then(res => res.ok)
            .catch(err => false);
    } catch {
        return new Promise(resolve => resolve(false));
    }
};

const Media = ({ state, serverAddress }) => {
    console.log(state, serverAddress);

    const [currentJSON, setCurrentJSON] = useState("");

    const [submitResult, setSubmitResult] = useState(null);
    useEffect(() => {
        console.log(submitResult);
        if (submitResult != null) {
            setTimeout(() => {
                setSubmitResult(null);
            }, 1000);
        }
    }, [submitResult]);

    useEffect(() => {
        setCurrentJSON(JSON.stringify(state.currentValues, null, 2));
    }, [state.currentValues]);

    const resetCurrentValue = () => {
        setCurrentJSON(JSON.stringify(state.currentValues, null, 2));
    };

    return (
        <div className={`${styles.parent}`}>
            <div className={styles.index}>{state.currentIndex}</div>

            <div className={styles.input}>
                <textarea
                    className={styles.textarea}
                    name={"update lowerthirds"}
                    rows={"200"}
                    value={currentJSON}
                    onChange={e => setCurrentJSON(e.target.value)}
                />
            </div>

            <div className={styles.buttons}>
                <button
                    className={styles.button}
                    onClick={() => {
                        console.log(state);
                        sendIndex(state.currentIndex + 1, serverAddress);
                    }}>
                    Next
                </button>
                <button className={styles.button} onClick={() => sendIndex(state.currentIndex - 1, serverAddress)}>
                    Prev
                </button>
                <button
                    style={{ backgroundColor: submitResult != null ? (submitResult ? "green" : "red") : "white" }}
                    className={styles.button}
                    onClick={() => updateLowerThirds(state.currentIndex, currentJSON, serverAddress, "set").then(ok => setSubmitResult(ok))}>
                    Change
                </button>
                <button
                    style={{ backgroundColor: submitResult != null ? (submitResult ? "green" : "red") : "white" }}
                    className={styles.button}
                    onClick={() => updateLowerThirds(state.currentIndex, currentJSON, serverAddress, "add").then(ok => setSubmitResult(ok))}>
                    Add
                </button>
                <button
                    style={{ backgroundColor: submitResult != null ? (submitResult ? "green" : "red") : "white" }}
                    className={styles.button}
                    onClick={() => updateLowerThirds(state.currentIndex, currentJSON, serverAddress, "remove").then(ok => setSubmitResult(ok))}>
                    Remove
                </button>
                <button className={styles.button} onClick={() => resetCurrentValue()}>
                    Reset
                </button>
            </div>
        </div>
    );
};

Media.propTypes = {};

export default Media;
