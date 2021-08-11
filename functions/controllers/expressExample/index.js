const express = require("express");
const cors = require("cors");
const app = express();

var corsOptions = {
  origin: "https://www.cruzhacks.com/",
  optionsSuccessStatus: 200,
};

const { addDocument } = require("../../utils/database");

app.get("/", cors(corsOptions), async (req, res) => {
  try {
    addDocument("users", { test: "functions" });
    res.status(201).send({ code: 201, message: "Added data from db example" });
  } catch (error) {
    res.status(500).send({ code: 500, message: "Unable to retrieve user from database" });
  }
});

module.exports = { app };
