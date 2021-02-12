import React from "react";
import styles from "./Tally.module.css";

const Tally = ({ state, index }) => {
  let color = "black";
  if (state?.program?.index === index) {
    color = "#ff0000";
  } else if (state?.preview?.index === index) {
    if (state?.inTransition) {
      color = "#ff0000";
    } else {
      color = "#00ff00";
    }
  }

  return <div style={{ backgroundColor: color }} className={styles.parent} />;
};

Tally.propTypes = {};

export default Tally;
