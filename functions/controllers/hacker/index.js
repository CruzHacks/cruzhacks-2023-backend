const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasCreateAdmin, hasReadHacker } = require("../../utils/middleware");
const { db, setDocument, updateDocument, queryDocument } = require("../../utils/database");

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

const makeIDSearchable = async (db, auth0ID, email) => {
  try {
    const auth0IDSearchRef = db.collection("Searches").doc("auth0IDSearch");
    const auth0SearchDoc = await auth0IDSearchRef.get();
    if (!auth0SearchDoc.exists) {
      const searchDoc = {
        emailSearch: {},
      };
      await setDocument("Searches", "auth0IDSearch", searchDoc);
    }
    await db.runTransaction(async (t) => {
      const doc = await t.get(auth0IDSearchRef);
      const newEmailSearch = { ...doc.data().emailSearch, [email]: auth0ID };
      console.log(newEmailSearch);
      t.update(auth0IDSearchRef, { emailSearch: newEmailSearch });
    });
  } catch (err) {
    functions.logger.log(`Could Not Make Reverse Search Document`);
  }
  return;
};

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

    makeIDSearchable(db, req.body.auth0ID, req.body.email);

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
