const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");

const { addDocument } = require("../../utils/database");
const { jwtCheck } = require("../../utils/middleware");
const { corsConfig, api_token, api_url } = require("../../utils/config");

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

app.post("/resend", jwtCheck, async (req, res) => {
  // this endpoint takes in a user_id then converts
  // it into an API call
  try {
    const checkIfVerifiedOptions = {
      // options for the API call
      method: "GET",
      url: api_url + "users/" + req.user.sub,
      headers: { authorization: "Bearer " + api_token },
    };

    const checkIfVerified = await axios(checkIfVerifiedOptions);
    if (checkIfVerified.data.email_verified) {
      throw "Email Already Verified";
    }
    const sendVerificationEmail = {
      // options for the API call
      method: "POST",
      url: api_url + "jobs/verification-email",
      headers: { authorization: "Bearer " + api_token },
      data: {
        user_id: req.user && req.user.sub ? req.user.sub : "",
      },
    };

    // make API call then response
    const verificationEmailRes = await axios(sendVerificationEmail);
    if (verificationEmailRes.status === 201) {
      res.status(201).send({ code: 201, message: "Verification Email Sent" });
    } else {
      throw "Could not Send";
    }
  } catch (err) {
    if (err === "Email Already Verified") {
      res.status(406).send({ code: 406, message: "Email Already Verified" });
    } else {
      res.status(500).send({ code: 500, message: "Unable to Send Verification Email" });
    }
  }
});

module.exports = { app };
