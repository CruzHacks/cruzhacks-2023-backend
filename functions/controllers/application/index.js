const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const formidable = require("formidable-serverless");

const { storage } = require("../../utils/admin");
const { jwtCheck, hasUpdateApp } = require("../../utils/middleware");
const { corsConfig, issuer } = require("../../utils/config");
const { getM2MToken } = require("../../utils/m2m");
const { createAppObject, validateAppData, validateResume, isValidFileData } = require("../../utils/application");
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
    return await form.parse(req, async (err, fields, files) => {
      if (err) {
        // TODO: Log Errors
        return res.status(500).send({ code: 400, message: "Server Error" });
      }
      try {
        // TODO: Update createAppObject and validateAppObject functions
        appData = createAppObject(fields);
        const isValidData = validateAppData(appData);

        if (isValidData.length > 0) {
          // TODO: Log Errors
          return res.status(400).send({ code: 400, message: "Form Validation Failed", errors: isValidData });
        }

        const isValidResume = validateResume(files);
        if (isValidResume.length > 0) {
          // TODO: Log Errors
          return res.status(400).send({ code: 400, message: "Resume Validation Failed", errors: isValidResume });
        }

        const token = await getM2MToken();
        const userInfoOptions = {
          method: "GET",
          url: api_url + "users/" + req.user.sub,
          headers: { authorization: "Bearer " + token },
        };

        const userInfo = await axios(userInfoOptions);
        if (!userInfo.data.email_verified) {
          // TODO: Log unverified email
          return res.status(403).send({ code: 403, message: "Unauthorized User" });
        }
        if (userInfo.data.email !== appData.email) {
          // TODO: Log expected email and actual email
          return res.status(400).send({ code: 400, message: "Auth0Id discrepancy with Email" });
        }

        // Upload Resume Here
        if (files && files.file) {
          // TODO: Update Resume File Name
          return (
            uploadFile(storage, "resume", "resume.pdf", files.file)
              .then((filedata) => {
                // Checks if upload URL exists
                if (isValidFileData(filedata)) {
                  // TODO: Set Document
                  // return setDocument.then( ())
                } else {
                  return res.status(400).send({ code: 400, message: "An Error Occurred Uploading Your Resume" });
                }
                return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
              })
              // eslint-disable-next-line no-unused-vars
              .catch((error) => {
                // Log Errors

                return res.status(400).send({ code: 500, message: "Server Error" });
              })
          );
        } else {
          // TODO: Set Document
        }
        return res.status(201).send({ code: 201, message: "Successfully Updated Application" });
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

module.exports = { application };
