const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { jwtCheck, hasCreateAdmin, hasUpdateHacker } = require("../../utils/middleware");
const { setDocument, queryDocument, transaction } = require("../../utils/database");
const { customAlphabet } = require("nanoid");

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
    if (typeof req.body.points !== "number") {
      res.status(500).send("Invalid Body Type");
      return;
    }

    const activityDocument = {
      activity: req.body.activity,
      points: req.body.points,
    };

    await setDocument("CruzPoints", code, activityDocument);
    res.status(201).send({ status: 201, message: "Activity Created", cruzPointsCode: code });
  } catch (err) {
    functions.logger.log(`Could Not Create Activity,\nError: ${err}`);
    res.status(500).send({ status: 500, message: "Activity Coould Not Be Created" });
  }
});

cruzpoints.post("/submitCode", jwtCheck, hasUpdateHacker, async (req, res) => {
  try {
    const code = req.body.code;
    const activity = await queryDocument("CruzPoints", code);

    if (activity.exists) {
      const doc = (await queryDocument("Hackers", req.user.sub)).data();
      if (doc.usedCodes[code] === true) {
        res.status(500).send({ status: 500, error: "Code Used" });
        functions.logger.log(`Code Used for ${req.user.sub}`);
        return;
      }

      let newPoints = 0;

      await transaction("Hackers", req.user.sub, async (t, docRef) => {
        const hackerDoc = (await docRef.get()).data();
        newPoints = hackerDoc.cruzPoints + activity.data().points;
        const newUsedCodes = { ...hackerDoc.usedCodes, [code]: true };
        t.update(docRef, { cruzPoints: newPoints, usedCodes: newUsedCodes });
      });

      res.status(200).send({ status: 200, updatedPoints: newPoints });
      functions.logger.log(`CruzPoints Updated for ${req.user.sub}`);
    } else {
      res.status(500).send({ status: 500, Error: "Activity Does Not Exist" });
      functions.logger.log(`Activity ${code} does not exist`);
    }
  } catch (err) {
    functions.logger.log(`Could Not Update CruzPoints for ${req.user.sub},\nError: ${err}`);
    res.status(500).send({ status: 500 });
  }
});

const service = functions.https.onRequest(cruzpoints);

module.exports = { cruzpoints, service };
