const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./interview-prep-ai-2105-firebase-adminsdk-fbsvc-d366e9f39d.json");

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

module.exports = {
    getAuth,
};