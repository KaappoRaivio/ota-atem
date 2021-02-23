import express from "express";
import path = require("path");
import app from "./backend/src/index";

app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/client/build/index.html"));
});

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log("Started production server");
});
