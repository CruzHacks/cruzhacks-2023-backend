const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasReadAdmin, hasCreateAdmin } = require("../../utils/middleware");
const { queryCollection, queryDocument, documentRef, dbTransaction } = require("../../utils/database");

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
      let checkIn = data.checkedIn;
      if (checkIn === undefined) {
        checkIn = false;
      }
      hackerDocs.push({
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        attendanceStatus: data.attendanceStatus,
        checkedIn: checkIn,
      });
    });

    res.status(200).send({ status: 200, hackers: hackerDocs });
  } catch (err) {
    res.status(500).send({ status: 500, error: "Unable to retrieve hackers" });
    functions.logger.log(`Unable to retrieve hacker document for EVERYONE,\nError: ${err}`);
  }
});

admin.get("/getHacker/:id", jwtCheck, hasReadAdmin, async (req, res) => {
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
admin.put("/checkIn/:id", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    let name = "";
    await dbTransaction(async (t) => {
      try {
        const docRef = documentRef("Hackers", req.params.id);
        const hackerDoc = (await docRef.get()).data();
        name = `${hackerDoc.firstName} ${hackerDoc.lastName}`;
        const attendanceStatus = hackerDoc.attendanceStatus;
        if (attendanceStatus !== "CONFIRMED") {
          throw new Error("Hacker Is Not RSVP'd");
        }
        t.update(docRef, { checkedIn: true });
      } catch (err) {
        throw new Error(err.message);
      }
    });
    res.status(201).send({ status: 201, message: `Checked In ${name}` });
  } catch (err) {
    if (err.message === "Hacker Is Not RSVP'd") {
      res.status(500).send({ status: 500, error: "Hacker Is Not RSVP'd" });
      return;
    }
    functions.logger.error(err);
    res.status(500).send({ status: 500, error: `Error occurred in check in` });
  }
});

const service = functions.https.onRequest(admin);

module.exports = { admin, service };
