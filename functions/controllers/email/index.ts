import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import { validKey } from "../../utils/middleware";

import * as client from "@mailchimp/mailchimp_marketing";

const mailchimpConfig = functions.config().mailchimp;

client.setConfig({
  apiKey: mailchimpConfig.apikey,
  server: mailchimpConfig.server_prefix,
});

export const subscribeMailchimp = async (userEmail: string) => {
  const response = await client.lists.addListMember(mailchimpConfig.audiance_id, {
    email_address: userEmail,
    status: "subscribed",
  });
  console.log(response);
  return response;
};

const auth0Config = functions.config().auth;
const corsConfig = auth0Config ? auth0Config.cors : "";

const email = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

email.disable("x-powered-by");
email.use(cors(corsOptions));
email.use(express.json());

email.post("/", validKey, async (req, res) => {
  const { email } = req.query;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  try {
    await subscribeMailchimp(email as string);
    res.status(201).json({ message: "Email subscribed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

email.get("/status", validKey, async (req, res) => {
  try {
    const response = await client.ping.get();
    if (!(response as client.ping.APIHealthStatus).health_status) {
      functions.logger.error(response);
      throw new Error("mailchimp errror");
    }
    res.status(200).json(response);
  } catch (e) {
    functions.logger.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
const service = functions.https.onRequest(email);

export { email, service };
