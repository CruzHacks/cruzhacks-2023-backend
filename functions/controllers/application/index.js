const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { jwtCheck } = require("../../utils/middleware");
const { queryDocument, setDocument, uploadFile } = require("../../utils/database");

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
            return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
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
      return (
        setDocument("applicants", req.user.sub, appData)
          // eslint-disable-next-line no-unused-vars
          .then((data) => {
            return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
          })
          .catch((error) => {
            functions.logger.log(error);
            return res.status(500).send({ code: 500, message: "Server Error" });
          })
      );
    }
  });
});

application.get("/checkApp", jwtCheck, async (req, res) => {
  try {
    const doc = await queryDocument("applicants", req.user.sub);
    const appStatus = doc.get("status");
    if (appStatus === undefined) {
      throw new Error("No Document");
    }
    res.status(200).send({ code: 200, status: appStatus, exists: true, message: "Document Found" });
  } catch (error) {
    if (error.message === "No Document") {
      res.status(200).send({ code: 200, status: "No Document", exists: false, message: "No Document" });
    } else {
      res.status(500).send({ code: 500, status: "No Document", exists: false, message: "Internal Server Error" });
    }
  }
});

const service = functions.https.onRequest(application);

module.exports = { application, service };
