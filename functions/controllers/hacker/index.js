const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasCreateAdmin, hasReadHacker } = require("../../utils/middleware");
const { setDocument, queryDocument, docTransaction } = require("../../utils/database");

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

const makeIDSearchable = async (auth0ID, email) => {
  try {
    const auth0SearchDoc = await queryDocument("Searches", "auth0IDSearch");

    if (!auth0SearchDoc.exists) {
      const searchDoc = {
        emailSearch: {},
      };
      await setDocument("Searches", "auth0IDSearch", searchDoc);
    }

    await docTransaction("Searches", "auth0IDSearch", async (t, docRef) => {
      const doc = (await t.get(docRef)).data();
      const newEmailSearch = { ...doc.emailSearch, [email]: auth0ID };
      t.update(docRef, { emailSearch: newEmailSearch });
    });
  } catch (err) {
    throw new Error("Could Not Make/Update Reverse Search Document");
  }
  return;
};

hacker.post("/createHacker", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    const hackerProfile = {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      attendanceStatus: "NOT CONFIRMED",
      cruzPoints: 0,
      invitationMode: "JOIN",
      usedCodes: {},
      team: {},
      invitations: Array(),
    };

    await setDocument("Hackers", req.body.auth0ID, hackerProfile);
    functions.logger.log(`Hacker Profile Created For ${req.body.firstName}`);

    await makeIDSearchable(req.body.auth0ID, req.body.email);

    res.status(201).send({ status: 201 });
  } catch (err) {
    functions.logger.log(`Could Not Create Hacker Profile For ${req.body.firstName},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Create Hacker Document" });
  }
});

hacker.post("/bulkCreateHackers", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    const users = req.body.users;
    users.forEach(async (user) => {
      const hackerProfile = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        attendanceStatus: "NOT CONFIRMED",
        cruzPoints: 0,
        invitationMode: "JOIN",
        usedCodes: {},
        team: {},
        invitations: Array(),
      };

      await setDocument("Hackers", user.auth0ID, hackerProfile);
      await makeIDSearchable(user.auth0ID, user.email);
      functions.logger.log(`Hacker Profile Created For ${user.firstName}`);
    });
    res.status(201).send({ status: 201 });
  } catch (err) {
    functions.logger.log(`Could Not Create Hacker Profiles,\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Create Hacker Documents" });
  }
});

hacker.put("/setAttendanceStatus", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const confirmedStatus = req.body.confirmedStatus;
    if (confirmedStatus !== "CONFIRMED" && confirmedStatus !== "NOT ATTENDING") {
      console.log(confirmedStatus);
      res.status(400).send({ status: 400, error: "Invalid Attendance Status" });
      return;
    }
    await docTransaction("Hackers", req.user.sub, async (t, docRef) => {
      const doc = (await t.get(docRef)).data();
      const attendanceStatus = doc.attendanceStatus;
      if (attendanceStatus === "NOT ATTENDING") {
        throw new Error("Can't change status of non attending hacker");
      }
      t.update(docRef, { attendanceStatus: confirmedStatus });
    });
    res.status(200).send({ status: 200, message: "Attendance Status Confirmed", attendanceStatus: confirmedStatus });
  } catch (err) {
    functions.logger.log(`Could not update attendance for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Update Attendance" });
  }
});

hacker.get("/hackerProfile", jwtCheck, hasReadHacker, async (req, res) => {
  try {
    const docGet = await queryDocument("Hackers", req.user.sub);
    if (!docGet.exists) {
      functions.logger.log(`Could not fetch profile for ${req.user.sub},\nError: Document does not exist`);
      res.status(500).send({ status: 500, error: "No Hacker Profile" });
      return;
    }

    const doc = docGet.data();
    const profileFields = {
      cruzPoints: doc.cruzPoints,
      attendanceStatus: doc.attendanceStatus,
    };

    res.status(200).send({ status: 200, hackerProfile: profileFields });
  } catch (err) {
    functions.logger.log(`Could not fetch profile for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could not fetch hacker profile" });
  }
});

const service = functions.https.onRequest(hacker);

module.exports = { hacker, service };
