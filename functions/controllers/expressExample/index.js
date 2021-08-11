const express = require("express");
const app = express();
const { addDocument } = require("../../utils/database");
const cors = require("cors");
const { jwtCheck } = require("../../utils/middleware");
const { auth0Config } = require("../../utils/config");

const corsOptions = {
  origin: auth0Config.cors,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/", async (req, res) => {
  try {
    addDocument("users", { test: "functions" });
    res.status(201).send({ code: 201, message: "Added data from db example" });
  } catch (error) {
    res.status(500).send({ code: 500, message: "Unable to retrieve user from database" });
  }
});

app.post("/resend", jwtCheck, async (req, res) => {
  res.status(201).send({ message: "private body reached" });
});

module.exports = { app };
