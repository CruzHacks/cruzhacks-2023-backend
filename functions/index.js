const function_name = process.env.FUNCTION_NAME || process.env.K_SERVICE;
if (!function_name || function_name === "auth") {
  exports.auth = require("./controllers/auth/index").service;
}
if (!function_name || function_name === "verifyRecaptcha") {
  exports.verifyRecaptcha = require("./controllers/VerifyRecaptcha/index").service;
}
if (!function_name || function_name === "announcements") {
  exports.announcements = require("./controllers/announcements-api/index").service;
}
if (!function_name || function_name === "applicants") {
  exports.applicants = require("./controllers/applicants/index").service;
}
if (!function_name || function_name === "application") {
  exports.application = require("./controllers/application/index").service;
}
if (!function_name || function_name === "analytics") {
  exports.analytics = require("./controllers/analytics/index").service;
}
if (!function_name || function_name === "writeToAnalytics") {
  exports.writeToAnalytics = require("./utils/analytics").service;
}
