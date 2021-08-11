const dotenv = require("dotenv");
dotenv.config();

const config = {
  // config settings for Auth0
  // will be passed as an export
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  secret: process.env.SECRET,
};

const checkAuthenticated = (req, res) => {
  // basic auth checking and response
  res.send(req.oidc.isAuthenticated() ? "Logged In" : "Logged Out");
};

module.exports = { config, checkAuthenticated };
