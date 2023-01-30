const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { jwtCheck, hasUpdateStatus, hasReadAdmin } = require("../../utils/middleware");
const { queryDocument, setDocument, uploadFile, db, queryCollection } = require("../../utils/database");

const {
  createAppObject,
  validateAppData,
  validateResume,
  isValidFileData,
  getNewFileName,
} = require("../../utils/application");
const formidable = require("formidable-serverless");

const application = express();
application.disable("x-powered-by");
application.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

const app = functions.config().app;
const bucket = app ? app.bucket : "";

application.use(cors(corsOptions));

const validAppStatuses = /pending|accepted|rejected|confirmed|waitlisted/;

application.post("/submit", jwtCheck, async (req, res) => {
  const form = new formidable.IncomingForm();
  return await form.parse(req, async (err, fields, files) => {
    if (err) {
      functions.logger.log("Form Error: " + err);
      return res.status(500).send({ code: 500, message: "Server Error" });
    }
    const appData = createAppObject(fields);
    if (appData === null) {
      functions.logger.log("Form Error on Create");
      return res.status(400).send({ code: 400, message: "Form Validation Failed", errors: isValidData });
    }
    const isValidData = validateAppData(appData);
    if (isValidData.length > 0) {
      functions.logger.log(appData);
      functions.logger.log(req.user.sub + " Validation Errors " + isValidData);
      return res.status(400).send({ code: 400, message: "Form Validation Failed", errors: isValidData });
    }
    const isValidResume = validateResume(files);
    if (isValidResume.length > 0) {
      functions.logger.log(req.user.sub + " Validation Errors " + isValidResume);
      return res.status(400).send({ code: 400, message: "Resume Validation Failed", errors: isValidResume });
    }
    if (files && files.file) {
      functions.logger.log(req.user.sub + "is submitting with a resume");
      return (
        uploadFile(bucket, getNewFileName(appData, files.file.name, req.user.sub), files.file)
          .then((filedata) => {
            // Checks if upload URL exists
            if (isValidFileData(filedata)) {
              return setDocument("applicants", req.user.sub, appData);
            } else {
              throw new Error("Upload Error");
            }
          })
          // eslint-disable-next-line no-unused-vars
          .then((data) => {
            return res.status(201).send({ code: 201, message: `Successfully Updated Application for ${req.user.sub}` });
          })
          .catch((error) => {
            functions.logger.log("Resume Upload: " + error.message);
            if (error.message === "Upload Error") {
              return res.status(400).send({ code: 400, message: "An Error Occurred Uploading Your Resume" });
            }
            return res.status(500).send({ code: 500, message: "Server Error" });
          })
      );
    } else {
      functions.logger.log(req.user.sub + "is submitting without a resume");
      return (
        setDocument("applicants", req.user.sub, appData)
          // eslint-disable-next-line no-unused-vars
          .then((data) => {
            return res.status(201).send({ code: 201, message: `Successfully Updated Application for ${req.user.sub}` });
          })
          .catch((error) => {
            functions.logger.log(error);
            return res.status(500).send({ code: 500, message: "Server Error" });
          })
      );
    }
  });
});

application.put("/updatestatus/:id", jwtCheck, hasUpdateStatus, async (req, res) => {
  /*
    req.body.status === "pending" | "accepted" | "rejected" | "confirmed" | "waitlisted"
  */

  const applicant_id = req.params.id;
  const status = req.body.status;

  if (!status) {
    functions.logger.log("Status Update: Missing status in request Body");
    return res.status(400).send({ code: 400, message: "Missing 'status' in request body" });
  }

  if (!status.match(validAppStatuses)) {
    functions.logger.log("Status Update: invalid status");
    return res.status(400).send({ code: 400, message: "Status must be ACCEPT, REJECT, or PENDING" });
  }

  const appData = {
    status: status,
  };

  // Update status
  functions.logger.log(req.user.sub + " status is updated: " + status);
  return setDocument("applicants", applicant_id, appData)
    .then((data) => {
      if (!data) {
        functions.logger.log("Status Update: application not found");
        return res.status(404).send({ code: 404, message: "Application Not Found" });
      }
      return res
        .status(200)
        .send({ code: 200, message: `Successfully Updated Application status for ${req.user.sub}` });
    })
    .catch((error) => {
      functions.logger.log("Status Update: ", error);
      return res.status(500).send({ code: 500, message: "Server Error" });
    });
});

application.get("/checkApp", jwtCheck, async (req, res) => {
  try {
    const doc = await queryDocument("applicants", req.user.sub);
    const appStatus = doc.get("status");
    if (appStatus === undefined) {
      throw new Error("No Document");
    }
    return res
      .status(200)
      .send({ code: 200, status: appStatus, exists: true, message: `Document Found for ${req.user.sub}` });
  } catch (error) {
    if (error.message === "No Document") {
      return res
        .status(200)
        .send({ code: 200, status: "No Document", exists: false, message: `No Document for ${req.user.sub}` });
    } else {
      return res
        .status(500)
        .send({ code: 500, status: "No Document", exists: false, message: "Internal Server Error" });
    }
  }
});

application.get("/applications", jwtCheck, hasReadAdmin, async (req, res) => {
  
    req.query.status === "pending" | "accepted" | "rejected" | "confirmed" | "waitlisted"

  try {
    let applicants = undefined;
    if (!req.query.appStatus) {
      applicants = await queryCollection("applicants");
    } else if (req.query.appStatus.match(validAppStatuses)) {
      applicants = await db.collection("applicants").where("status", "==", req.query.appStatus).get();
    } else {
      throw new Error("Invalid App Status Request");
    }
    const appDocuments = [];

    applicants.forEach((doc) => {
      data = doc.data();
      appDocuments.push({
        applicant_id: doc.id,
        name: data.name,
        age: data.age,
        major: data.major,
        status: data.status,
      });
    });

    return res.status(200).send({ code: 200, applications: appDocuments });
  } catch (err) {
    functions.logger.log(`Query Error: ${err}`);
    return res.status(500).send({ code: 500, message: "Invalid Input" });
  }
});

const service = functions.https.onRequest(application);

module.exports = { application, service };
