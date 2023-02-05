const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasUpdateHacker, hasCreateAdmin, hasReadHacker, hasReadAdmin } = require("../../utils/middleware");
const { setDocument, queryDocument, docTransaction, collectionRef, storage } = require("../../utils/database");
const fs = require("fs");
const os = require("os");
const { nanoid } = require("nanoid");

const hacker = express();
hacker.disable("x-powered-by");
hacker.use(express.json());

const auth0Config = functions.config().auth;
const app = functions.config().app;
const bucket = app ? app.bucket : "";

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

hacker.get("/searchHacker", jwtCheck, hasReadAdmin, async (req, res) => {
  try {
    const hackerEmail = req.body.hackerEmail;
    const searchesDoc = (await queryDocument("Searches", "auth0IDSearch")).data();
    const hackerAuth0ID = searchesDoc.emailSearch[hackerEmail];

    const hackerDoc = (await queryDocument("Hackers", hackerAuth0ID)).data();
    res.status(200).send({ status: 200, hackerDoc: hackerDoc });
    functions.logger.log(`Retrieved Hacker Document for ${hackerEmail}`);
  } catch (err) {
    res.status(500).send({ status: 500, error: "Unable to retrieve hacker document" });
    functions.logger.log(`Unable to retrieve hacker document for ${req.body.hackerEmail},\nError: ${err}`);
  }
});

hacker.post("/bulkCreateHackers", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    const users = req.body.users;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
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
        completedActivities: {},
      };

      await setDocument("Hackers", user.auth0ID, hackerProfile);
      await makeIDSearchable(user.auth0ID, user.email);
      functions.logger.log(`Hacker Profile Created For ${user.firstName}`);
    }
    res.status(201).send({ status: 201 });
  } catch (err) {
    functions.logger.log(`Could Not Create Hacker Profiles,\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Could Not Create Hacker Documents" });
  }
});

hacker.put("/setAttendanceStatus", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const lockoutDate = new Date(2023, 0, 27, 7, 59, 59); // UTC time
    const currentDate = new Date();
    const confirmedStatus = req.body.confirmedStatus;

    if (currentDate.getTime() > lockoutDate.getTime() && confirmedStatus === "CONFIRMED") {
      res.status(500).send({ status: 500, error: "RSVP is locked out" });
      functions.logger.error("Locked Out");
      return;
    }

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
      functions.logger.error(`Could not fetch profile for ${req.user.sub},\nError: Document does not exist`);
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
    res.status(500).send({ status: 500, error: "Could not fetch hacker profile", err: err });
  }
});

hacker.get("/exportHackers", jwtCheck, hasReadAdmin, async (req, res) => {
  try {
    const hackersRef = collectionRef("Hackers");
    const RSVPHackers = await hackersRef.where("attendanceStatus", "==", "CONFIRMED").get();
    if (RSVPHackers.empty) {
      res.status(500).send({ status: 500, error: "No Hackers Are RSVP'd" });
      return;
    }
    let RSVPHackersCSV = "Email,First Name,Last Name\n";
    RSVPHackers.forEach((docRef) => {
      const doc = docRef.data();
      RSVPHackersCSV += `${doc.email},${doc.firstName},${doc.lastName}\n`;
    });
    const uploadedFileName = "/exportedhackers-" + nanoid(5) + ".csv";
    fs.writeFileSync(os.tmpdir() + uploadedFileName, RSVPHackersCSV, "utf-8");

    await storage.bucket(bucket).upload(os.tmpdir() + uploadedFileName);
    res.status(200).send({ status: 200, message: `Exported To ${uploadedFileName}` });
  } catch (err) {
    functions.logger.error(err);
    res.status(500).send({ status: 500, error: "Error fetching RSVP'd Hackers" });
  }
});

hacker.get("/exportHackersCheckedIn", jwtCheck, hasReadAdmin, async (req, res) => {
  try {
    const hackersRef = collectionRef("Hackers");
    const checkedInHackers = await hackersRef.get();
    if (checkedInHackers.empty) {
      res.status(500).send({ status: 500, error: "No Hackers Are Checked In" });
      return;
    }
    let checkedInCSV = "Email,First Name,Last Name\n";
    checkedInHackers.forEach((docRef) => {
      const doc = docRef.data();
      checkedInCSV += `${doc.email},${doc.firstName},${doc.lastName},${doc.checkedIn}\n`;
    });
    const uploadedFileName = "/exportedhackers-" + nanoid(5) + ".csv";
    fs.writeFileSync(os.tmpdir() + uploadedFileName, checkedInCSV, "utf-8");

    await storage.bucket(bucket).upload(os.tmpdir() + uploadedFileName);
    res.status(200).send({ status: 200, message: `Exported To ${uploadedFileName}` });
  } catch (err) {
    functions.logger.error(err);
    res.status(500).send({ status: 500, error: "Error fetching checked in Hackers" });
  }
});

const service = functions.https.onRequest(hacker);

module.exports = { hacker, service };
