/* eslint-disable consistent-return */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const formidable = require("formidable-serverless");

const { storage } = require("../../utils/admin");
const { jwtCheck, hasUpdateApp } = require("../../utils/middleware");
const { corsConfig, issuer } = require("../../utils/config");
const { getM2MToken } = require("../../utils/m2m");
const { createAppObject, validateAppData, validateResume } = require("../../utils/application");
const { uploadFile } = require("../../utils/storage");

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

application.post("/submit", jwtCheck, hasUpdateApp, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    await form.parse(req, async (err, fields, files) => {
      if (err) {
        // Log Errors
        throw "Error Parsing Form";
      }
      try {
        // TODO: Update createAppObject and validateAppObject functions
        appData = createAppObject(fields);
        const isValidData = validateAppData(appData);

        if (isValidData.length > 0) {
          // TODO: Log Errors
          throw "Form Validation Failed";
        }

        const isValidResume = validateResume(files);
        if (isValidResume.length > 0) {
          // TODO: Log Errors
          throw "Resume Validation Failed";
        }

        const token = await getM2MToken();
        const userInfoOptions = {
          method: "GET",
          url: api_url + "users/" + req.user.sub,
          headers: { authorization: "Bearer " + token },
        };

        const userInfo = await axios(userInfoOptions);
        if (!userInfo.data.email_verified) {
          throw "Email Not Verified";
        }
        if (userInfo.data.email !== appData.email) {
          throw "Auth0 Id email mistmatch";
        }

        let uploadErr = "";
        // Upload Resume Here
        if (files && files.file) {
          // TODO: Update Resume File Name
          uploadFile(storage, "resume", "resume.pdf", files.file)
            .then((filedata) => {
              // Checks if upload URL exists
              if (filedata && (filedata.length > 0) && filedata[filedata.length - 1] && filedata[filedata.length - 1]["mediaLink"]) {
                // TODO: Set Document
              } else {
                uploadErr = "An error has Occurred";
              }
            })
            .catch((error) => {
              uploadErr = error;
            });
        } else {
          // TODO: Set Document
        }
        if (uploadErr) {
          throw uploadErr;
        }
        return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
      } catch (err) {
        // Log Errors
        if (err === "Email Not Verified") {
          return res.status(403).send({ code: 403, message: "Unauthorized User" });
        } else if (err === "Auth0 Id email mistmatch") {
          return res.status(404).send({ code: 400, message: "Auth0Id discrepancy with Email" });
        } else {
          return res.status(500).send({ code: 500, message: err });
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ code: 500, message: error });
  }
});

module.exports = { application };
