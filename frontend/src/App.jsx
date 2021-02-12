import React, { useEffect, useState } from "react";

import styles from "./App.module.css";
import Tally from "./Tally.jsx";

const useCommunication = atemIP => {
  const [state, setState] = useState({});
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(atemIP);
    const socket = new WebSocket(atemIP);
    socket.onmessage = event => {
      console.log(event.data);
      if (connecting) {
        setConnecting(false);
      }
      setState(JSON.parse(event.data));
    };
    socket.onerror = setError;
  }, [atemIP]);

  useEffect(() => {
    console.log(state);
  }, [state]);

  return { connecting, state, error };
};

const App = props => {
  const index = 4;
  const { connecting, state, error } = useCommunication("ws://192.168.10.101:7634/");

  return (
    <div className={styles.parent}>
      <Tally state={state} index={index} />
    </div>
  );
};

App.propTypes = {};

export default App;
