import React from "react";
import styles from "./Media.module.css";

const sendIndex = (index, serverAddress) => {
    console.log(index);
    fetch(`http://${serverAddress}/setMediaIndex`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
    });
};
const Media = ({ state, serverAddress }) => {
    return (
        <div className={`${styles.parent}`}>
            <div className={styles.child}>
                <p className={styles.index}>{state.currentIndex}</p>
                {Object.keys(state.currentValues).map(key => (
                    <p className={styles.title}>{key + " " + state.currentValues[key]}</p>
                ))}

                {/*<p className={styles.subtitle}>{state.currentValues?.subtitle}</p>*/}
            </div>
            <div className={styles.child}>
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
        </div>
    );
};

Media.propTypes = {};

export default Media;
