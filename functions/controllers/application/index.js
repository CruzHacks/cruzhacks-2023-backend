const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const formidable = require("formidable-serverless");

const { storage } = require("../../utils/admin");
const { jwtCheck, hasUpdateApp, hasReadApp } = require("../../utils/middleware");
const { corsConfig, issuer } = require("../../utils/config");
const { getM2MToken } = require("../../utils/m2m");
const { createAppObject, validateAppData, validateResume, isValidFileData } = require("../../utils/application");
const { uploadFile } = require("../../utils/storage");
const { queryDocument, setDocument } = require("../../utils/database");

const application = express();
application.disable("x-powered-by");
application.use(helmet());
application.use(express.json());

const api_url = issuer + "api/v2/";

const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

application.use(cors(corsOptions));

/* TODO: 
  Update createAppObject and validateAppObject with schema
  Update document id posted (if necessary)
  Update getNewFileName to get unique filenames
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
        // TODO: Update createAppObject and validateAppObject functions
        appData = createAppObject(fields);
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
        // If bandwidth is too high, remove Auth0id validation
        const token = await getM2MToken();
        if (token === "") {
          functions.logger.log("Failed to retrieve Token");
          return res.status(500).send({ code: 500, message: "Server Error" });
        }
        const userInfoOptions = {
          method: "GET",
          url: api_url + "users/" + req.user.sub,
          headers: { authorization: "Bearer " + token },
        };

        const userInfo = await axios(userInfoOptions);
        if (!userInfo.data.email_verified) {
          functions.logger.log("Unauthorized User: " + userInfo.data.email);
          return res.status(403).send({ code: 403, message: "Unauthorized User" });
        }
        if (userInfo.data.email !== appData.email) {
          functions.logger.log("Email/Authid Mismatch: " + userInfo.data.email + " " + appData.email);
          return res.status(400).send({ code: 400, message: "Auth0Id discrepancy with Email" });
        }

        // Upload Resume Here
        if (files && files.file) {
          return (
            // TODO: update getNewFileName() and replace test.pdf
            uploadFile(storage, "resume", "test.pdf", files.file)
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
                // Log Errors
                if (error === "Upload Error") {
                  return res.status(400).send({ code: 400, message: "An Error Occurred Uploading Your Resume" });
                }
                return res.status(500).send({ code: 500, message: "Server Error" });
              })
          );
        } else {
          // TODO: Update Collection
          return (
            setDocument("applicants", req.user.sub, appData)
              // eslint-disable-next-line no-unused-vars
              .then((data) => {
                return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
              })
              .catch((error) => {
                // Log Error
                functions.logger.log(error);
                return res.status(500).send({ code: 500, message: "Server Error" });
              })
          );
        }
      } catch (error) {
        // Log Errors
        return res.status(500).send({ code: 500, message: "Server Error" });
      }
    });
  } catch (error) {
    // Log Errors
    return res.status(500).send({ code: 500, message: "Server Error" });
  }
});

application.get("/checkApp", jwtCheck, hasReadApp, async (req, res) => {
  try {
    doc = await queryDocument("applicants", req.user.sub);
    appStatus = doc.get("status");
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

module.exports = { application };
