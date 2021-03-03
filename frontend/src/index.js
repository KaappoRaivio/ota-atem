import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import TallyLanding from "./TallyLanding.jsx";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import LowerThirds from "./LowerThirds";

export const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
export const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:4000" : "";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route exact path={"/tally"} render={() => <TallyLanding />} />
                <Route exact path={"/lowerthirds"} render={() => <LowerThirds />} />
                <Route path={"/"} render={() => <Redirect to={"/tally"} />} />
            </Switch>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);
