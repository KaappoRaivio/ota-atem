import React from "react";
import styles from "./Tally.module.css";

const Tally = ({ state, index, connected }) => {
    let color = "black";
    if (state?.program?.index === index) {
        color = "#ff0000";
    } else if (state?.preview?.index === index) {
        if (state?.inTransition) {
            color = "#ff0000";
        } else {
            color = "#00ff00";
        }
    } else {
        color = "#333333";
    }

    console.log(connected);
    return (
        <div style={{ backgroundColor: color }} className={`${styles.parent} ${!connected ? styles.blink : ""}`}>
            <p className={styles.text}>{index}</p>
        </div>
    );
};

Tally.propTypes = {};

export default Tally;
