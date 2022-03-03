import React, { useEffect, useState } from "react";

import styles from "./Welcome.module.css";

const schema = [
    {
        label: "Server address",
        type: "input",
        technicalLabel: "serverAddress",
    },
    {
        label: "Camera",
        type: "input",
        technicalLabel: "camera",
    },
];

const Welcome = ({ onSubmit, initialValues }) => {
    const [formState, setFormState] = useState({...initialValues, camera: JSON.stringify(initialValues.camera)});
    console.log(initialValues)

    useEffect(() => {
        console.log(formState);
    }, [formState]);

    return (
        <div
            className={styles.parent}
            onSubmit={event => {
                event.preventDefault();
            }}>
            <div className={styles.content}>
                {schema.map(field => (
                    <div className={styles.field} key={field.technicalLabel}>
                        <span className={styles.label}>{field.label}</span>
                        <input
                            defaultValue={formState[field.technicalLabel]}
                            className={styles.input}
                            type={field.type}
                            onChange={event => {
                                setFormState(prevState => {
                                    return { ...prevState, [field.technicalLabel]: event.target.value };
                                });
                            }}
                        />
                    </div>
                ))}
                <button
                    onClick={() => {
                        console.log(formState);
                        onSubmit(formState);
                    }}>
                    Submit
                </button>
            </div>
        </div>
    );
};

Welcome.propTypes = {};

export default Welcome;
