const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasCreateAdmin, hasUpdateHacker, hasReadHacker } = require("../../utils/middleware");
const { setDocument, queryDocument, docTransaction, queryCollectionSorted } = require("../../utils/database");
const { customAlphabet } = require("nanoid");
const { cruzPointsActivityTypeRegex } = require("../../utils/regex");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789");

const cruzpoints = express();
cruzpoints.disable("x-powered-by");
cruzpoints.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

cruzpoints.use(cors(corsOptions));

cruzpoints.post("/createActivity", jwtCheck, hasCreateAdmin, async (req, res) => {
  try {
    const code = nanoid(7);
    const availabilityTime = new Date(req.body.availabilityTime + "-08:00");
    const expirationTime = new Date(req.body.expirationTime + "-08:00");

    if (!req.body.points || !req.body.activity || typeof req.body.points !== "number") {
      res.status(400).send({ status: 400, error: "Invalid Body Type" });
      return;
    }

    if (!cruzPointsActivityTypeRegex(req.body.activityType)) {
      res.status(400).send({ status: 400, error: "Invalid Activity Type" });
    }

    if (availabilityTime > expirationTime) {
      res.status(400).send({ status: 400, error: "Availability Time Must Come Before Expiration Time" });
      return;
    }

    const activityDocument = {
      activity: req.body.activity,
      points: req.body.points,
      availabilityTime: availabilityTime,
      expirationTime: expirationTime,
      activityType: req.body.activityType,
    };

    await setDocument("CruzPoints", code, activityDocument);
    res.status(201).send({ status: 201, message: "Activity Created", cruzPointsCode: code });
  } catch (err) {
    functions.logger.log(`Could Not Create Activity,\nError: ${err}`);
    res.status(500).send({ status: 500, error: "Activity Could Not Be Created" });
  }
});

cruzpoints.post("/submitCode", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const code = req.body.code;
    const activityRef = await queryDocument("CruzPoints", code);

    if (!activityRef.exists) {
      res.status(500).send({ status: 500, error: "Activity Does Not Exist" });
      functions.logger.log(`Activity ${code} does not exist`);
      return;
    }

    const activity = activityRef.data();

    const currDate = new Date();
    if (currDate < activity.availabilityTime.toDate() || currDate > activity.expirationTime.toDate()) {
      res.status(500).send({ status: 500, error: "Invalid Code" });
      return;
    }

    const doc = (await queryDocument("Hackers", req.user.sub)).data();
    if (doc.usedCodes[code] === true) {
      res.status(500).send({ status: 500, error: "Code Used" });
      functions.logger.log(`Code Used for ${req.user.sub}`);
      return;
    }

    let newPoints = 0;

    await docTransaction("Hackers", req.user.sub, async (t, docRef) => {
      const hackerDoc = (await docRef.get()).data();
      const activityType = activity.activityType;
      let activityTypeCount = 0;
      let completedActivities = {};
      if (hackerDoc.completedActivities && hackerDoc.completedActivities[activityType]) {
        completedActivities = hackerDoc.completedActivities;
        activityTypeCount = hackerDoc.completedActivities[activityType];
      }

      switch (activityType) {
        case "HackathonWorkshops":
          newPoints = hackerDoc.cruzPoints + activity.points + 50 * activityTypeCount;
          break;
        default:
          newPoints = hackerDoc.cruzPoints + activity.points;
          break;
      }

      const newUsedCodes = { ...hackerDoc.usedCodes, [code]: true };

      t.update(docRef, {
        cruzPoints: newPoints,
        usedCodes: newUsedCodes,
        completedActivities: { ...completedActivities, [activityType]: activityTypeCount + 1 },
      });
    });

    res.status(200).send({ status: 200, updatedPoints: newPoints });
    functions.logger.log(`CruzPoints Updated for ${req.user.sub}`);
  } catch (err) {
    functions.logger.log(`Could Not Update CruzPoints for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500 });
  }
});

cruzpoints.post("/updateLeaderBoard", jwtCheck, hasCreateAdmin, async (_req, res) => {
  try {
    await updateCruzPointsLeaderBoard();
    res.status(200).send({ status: 200, message: "Updated Leaderboard" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: 500 });
  }
});

cruzpoints.get("/leaderboard", jwtCheck, hasReadHacker, async (req, res) => {
  try {
    const leaderboardDoc = (await queryDocument("CruzPoints", "Leaderboard")).data();
    res.status(200).send({ status: 200, leaderboard: leaderboardDoc.leaderboard });
  } catch (err) {
    res.status(500).send({ status: 500 });
  }
});
const updateCruzPointsLeaderBoard = async () => {
  try {
    const topCruzPointsers = await queryCollectionSorted("Hackers", "cruzPoints", 20);
    let cruzPointsLeaderBoard = [];
    let position = 1;
    topCruzPointsers.forEach((e) => {
      const element = e.data();
      cruzPointsLeaderBoard.push({
        id: element.email || "",
        position: position,
        name: `${element.firstName} ${element.lastName}`,
        points: element.cruzPoints,
      });
      position++;
    });
    await setDocument("CruzPoints", "Leaderboard", { leaderboard: cruzPointsLeaderBoard }, true);
  } catch (err) {
    functions.logger.error(err);
  }
};

const service = functions.https.onRequest(cruzpoints);
const cruzPointsCronJob = functions.pubsub
  .schedule("every 10 minutes")
  .onRun((_context) => updateCruzPointsLeaderBoard());
module.exports = { cruzpoints, service, cruzPointsCronJob };
