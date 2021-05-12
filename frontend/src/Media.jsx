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
const Media = ({ state, serverAddress }) => {
    console.log(state, serverAddress);

    const [currentJSON, setCurrentJSON] = useState("");
    useEffect(() => {
        setCurrentJSON(JSON.stringify(state.currentValues, null, 2));
    }, [state.currentValues]);

    return (
        <div className={`${styles.parent}`}>
            <div className={styles.child}>
                <p className={styles.index}>{state.currentIndex}</p>

                {/*<p className={styles.subtitle}>{state.currentValues?.subtitle}</p>*/}
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
            </div>

            <div className={styles.input}>
                <textarea
                    className={styles.textarea}
                    name={"update lowerthirds"}
                    rows={"20"}
                    value={currentJSON}
                    onChange={e => setCurrentJSON(e.target.value)}
                />
            </div>
        </div>
    );
};

Media.propTypes = {};

export default Media;
