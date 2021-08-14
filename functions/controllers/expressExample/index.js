const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const functions = require("firebase-functions");

const { addDocument } = require("../../utils/database");
const { jwtCheck } = require("../../utils/middleware");
const { corsConfig } = require("../../utils/config");

const API_TOKENS = functions.config().tokens

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());

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

app.get("/resend", jwtCheck, async (req, res) => {
  try {
    res.status(201).send({ message: "Hello?" });
  } catch (error) {
    res.status(500).send({ code: 500, message: "Bad/No key" });
  }
});

app.post("/resend", jwtCheck, async (req, res) => {
  // this endpoint takes in a user_id then converts
  // it into an API call
  const options = {
    // options for the API call
    method: "POST",
    url: "https://cruzhacks.us.auth0.com/api/v2/jobs/verification-email",
    headers: { authorization: "Bearer " + API_TOKENS.email },
    data: {
      user_id: req.body.user_id,
    },
  };

  // make API call then response
  axios(options)
    .then((axios_res) => {
      res.status(201).json(axios_res.data);
    })
    .catch((axios_err) => {
      res.status(500).json(axios_err);
    });
});

module.exports = { app };
