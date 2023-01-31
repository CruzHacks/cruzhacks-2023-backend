const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasReadAdmin, hasUpdateHacker } = require("../../utils/middleware");
const { queryCollection, updateDocument } = require("../../utils/database");

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

admin.get("/getHackers", jwtCheck, hasReadAdmin, async (req, res) => {
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

/**
 * Does not take a request body
 */
admin.put("/checkIn/:id", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    await updateDocument("Hackers", req.params.id, { checkedIn: true });
    res.status(201).send({ status: 201, message: "successful update" });
  } catch (err) {
    res.status(500).send({ status: 500, error: `Error occurred in checkIn ${err}` });
  }
});

const service = functions.https.onRequest(admin);

module.exports = { admin, service };
