const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasCreateAdmin, hasReadHacker } = require("../../utils/middleware");
const { setDocument, updateDocument, queryDocument } = require("../../utils/database");

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

hacker.post("/createHacker", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    const hackerProfile = {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      isAttending: false,
      cruzPoints: 0,
      usedCodes: {},
    };

    await setDocument("Hackers", req.body.auth0ID, hackerProfile);
    functions.logger.log(`Hacker Profile Created For ${req.body.firstName}`);
    res.status(201).send({ status: 201 });
  } catch (err) {
    functions.logger.log(`Could Not Create Hacker Profile For ${req.body.firstName},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Create Hacker Document" });
  }
});

hacker.put("/isAttending", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    await updateDocument("Hackers", req.user.sub, { isAttending: true });
    res.status(200).send({ status: 200 });
  } catch (err) {
    functions.logger.log(`Could not update attendance for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Update Attendance" });
  }
});

hacker.get("/hackerProfile", jwtCheck, hasReadHacker, async (req, res) => {
  try {
    console.log(req.user.sub);
    const doc = await queryDocument("Hackers", req.user.sub);
    if (!doc.exists) {
      functions.logger.log(`Could not fetch profile for ${req.user.sub},\nError: Document does not exist`);
      res.status(500).send({ status: 500, error: "No Hacker Profile" });
    }
    res.status(200).send({ status: 200, hackerProfile: doc.data() });
  } catch (err) {
    functions.logger.log(`Could not fetch profile for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could not fetch hacker profile" });
  }
});

const service = functions.https.onRequest(hacker);

module.exports = { hacker, service };
