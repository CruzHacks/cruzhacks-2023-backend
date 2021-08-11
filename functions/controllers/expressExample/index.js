const express = require("express");
const cors = require("cors");
const { addDocument } = require("../../utils/database");
const { jwtCheck } = require("../../utils/middleware");
const { corsConfig } = require("../../utils/config");

const app = express();
app.disable("x-powered-by");

const corsOptions = {
  origin: corsConfig,
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
