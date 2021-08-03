const dotenv = require("dotenv");
dotenv.config();

const _config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBASEURL: process.env.ISSUER_BASE_URL,
  secret: process.env.SECRET,
};
