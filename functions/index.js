const functions = require("firebase-functions");

const function_name = process.env.FUNCTION_NAME || process.env.K_SERVICE;
if (!function_name || function_name === 'auth') {
    exports.auth = functions.https.onRequest(require("./controllers/auth/index").app);
}
if (!function_name || function_name === 'verifyRecaptcha') {
    exports.verifyRecaptcha = functions.https.onRequest(require("./controllers/VerifyRecaptcha/index").verifyRecaptcha);
}
if (!function_name || function_name === 'announcements') {
    exports.announcements = functions.https.onRequest(require("./controllers/announcements-api/index").announcements);
}
