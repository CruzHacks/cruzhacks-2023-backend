const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasReadAdmin } = require("../../utils/middleware");
const { queryCollection, queryDocument, updateDocument } = require("../../utils/database");

const admin = express();
admin.disable("x-powered-by");
admin.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

admin.use(cors(corsOptions));

admin.get("/getHackers", async (req, res) => {
  try {
    const hackers = await queryCollection("Hackers");
    const hackerDocs = [];
    hackers.forEach((doc) => {
      data = doc.data();
      hackerDocs.push({
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        attendanceStatus: data.attendanceStatus,
        checkedIn: data.checkedIn,
      });
    });

    res.status(200).send({ status: 200, hackers: hackerDocs });
  } catch (err) {
    res.status(500).send({ status: 500, error: "Unable to retrieve hackers" });
    functions.logger.log(`Unable to retrieve hacker document for EVERYONE,\nError: ${err}`);
  }
});

admin.get("/getHacker/:id", async (req, res) => {
  try {
    const doc = await queryDocument("Hackers", req.params.id);
    if (!doc.exists) {
      functions.logger.error(`Could not fetch profile for ${req.params.id},\nError: Document does not exist`);
      res.status(500).send({ status: 500, error: "No Hacker Profile" });
      return;
    }

    const data = doc.data();
    const hackerFields = {
      id: doc.id,
      firstName: data.firstName,
      lastName: data.lastName,
    };

    res.status(200).send({ status: 200, hacker: hackerFields });
  } catch (err) {
    res.status(500).send({ status: 500, error: "Unable to retrieve hacker" });
    functions.logger.log(`Unable to retrieve hacker document for ${req.params.id},\nError: ${err}`);
  }
});

/**
 * Does not take a request body
 */
admin.put("/checkIn/:id", jwtCheck, hasReadAdmin, async (req, res) => {
  try {
    await updateDocument("Hackers", req.params.id, { checkedIn: true });
    res.status(201).send({ status: 201, message: "successful update" });
  } catch (err) {
    functions.logger.error(`${err}`);
    res.status(500).send({ status: 500, error: `Error occurred in check in` });
  }
});

const service = functions.https.onRequest(admin);

module.exports = { admin, service };
