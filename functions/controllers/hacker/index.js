const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasCreateHacker, hasUpdateHacker } = require("../../utils/middleware");
const { setDocument, updateDocument } = require("../../utils/database");

const hacker = express();
hacker.disable("x-powered-by");
hacker.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

hacker.use(cors(corsOptions));

hacker.post("/createHacker", jwtCheck, hasCreateHacker, async (req, res) => {
  try {
    const hackerProfile = {
      email: req.body.email,
      isAttending: false,
      cruzPoints: 0,
    };

    const doc = await setDocument("Hackers", req.body.auth0ID, hackerProfile);
    console.log(doc);
    res.status(201).send({ status: 201 });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: 500, error: "Could Not Create Hacker Document" });
  }
});

hacker.put("/isAttending", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    console.log(req.user.sub);
    const updatedDoc = updateDocument("Hackers", req.user.sub, { isAttending: true });
    console.log(updatedDoc);
    res.status(200).send({ status: 200 });
  } catch (err) {
    console.log(err);
  }
});

const service = functions.https.onRequest(hacker);

module.exports = { hacker, service };
