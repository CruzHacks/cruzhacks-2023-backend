const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const formidable = require("formidable-serverless");

const { jwtCheck, hasUpdateApp, hasReadApp, hasReadAnalytics } = require("../../utils/middleware");
const {
  createAppObject,
  validateAppData,
  validateResume,
  isValidFileData,
  getNewFileName,
} = require("../../utils/application");
const { queryDocument, setDocument, uploadFile } = require("../../utils/database");

const application = express();
application.disable("x-powered-by");
application.use(express.json());

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

application.use(cors(corsOptions));

/* TODO: 
  Unit Test Functions
*/
application.post("/submit", jwtCheck, hasUpdateApp, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    return await form.parse(req, async (err, fields, files) => {
      if (err) {
        functions.logger.log("Form Error: " + err);
        return res.status(500).send({ code: 500, message: "Server Error" });
      }
      try {
        const appData = createAppObject(fields);
        if (appData === null) {
          return res.status(400).send({ code: 400, message: "Form Validation Failed", errors: isValidData });
        }
        const isValidData = validateAppData(appData);
        if (isValidData.length > 0) {
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
            uploadFile("resume", getNewFileName(appData, files.file.name, req.user.sub), files.file)
              .then((filedata) => {
                // Checks if upload URL exists
                if (isValidFileData(filedata)) {
                  return setDocument("applicants", req.user.sub, appData);
                } else {
                  throw "Upload Error";
                }
              })
              // eslint-disable-next-line no-unused-vars
              .then((data) => {
                return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
              })
              .catch((error) => {
                if (error === "Upload Error") {
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
      } catch (error) {
        return res.status(500).send({ code: 500, message: "Server Error" });
      }
    });
  } catch (error) {
    return res.status(500).send({ code: 500, message: "Server Error" });
  }
});

application.get("/checkApp", jwtCheck, hasReadApp, async (req, res) => {
  try {
    doc = await queryDocument("applicants", req.user.sub);
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

application.get("/analytics", jwtCheck, hasReadAnalytics, async (req, res) => {
  try {
    const analyticsSnapshot = await queryDocument("analytics", "applicant-analytics");
    if (!analyticsSnapshot.exists) {
      throw "No Doc";
    }
    res.status(201).send({
      message: {
        applicantCount: analyticsSnapshot.get("applicantCount"),
        firstTime: analyticsSnapshot.get("firstTimeCount"),
        ucscApplicants: analyticsSnapshot.get("ucscStudentCount"),
      },
    });
  } catch (err) {
    if (err === "No Doc") {
      res.status(404).send({ status: 404, message: "No Document" });
    }
    res.status(500).send({ status: 500, message: "Insufficient Permissions" });
  }
});

const service = functions.https.onRequest(application);

module.exports = { application, service };
