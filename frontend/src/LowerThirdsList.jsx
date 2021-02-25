import React from "react";

import styles from "./LowerThirdsList.module.css";

const LowerThirdsList = ({ lowerThirds, onDeleted }) => (
    <div className={styles.flex}>
        {lowerThirds.map(({ title, subtitle }, index) => (
            <LowerThird title={title} subtitle={subtitle} onDeleted={() => onDeleted(index)} />
        ))}
    </div>
);

const LowerThird = ({ title, subtitle, onDeleted }) => (
    <div className={styles.parent}>
        <div>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        <button onClick={onDeleted} className={styles.delete}>
            delete
        </button>
    </div>
);

LowerThirdsList.propTypes = {};

export default LowerThirdsList;
