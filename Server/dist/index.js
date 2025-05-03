"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const child_process_1 = require("child_process");
const app_1 = __importDefault(require("./app"));
const checkURI_1 = __importDefault(require("./utills/checkURI"));
const index_1 = __importDefault(require("./db/index"));
dotenv_1.default.config({ path: './.env' });
const requiredEnvVars = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "PORT", "MONGODB_URL"];
(0, checkURI_1.default)(requiredEnvVars);
const PORT = process.env.PORT || 8000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
// Kill any process using the port before starting the server
try {
    console.log(`Checking and killing process on port ${PORT}...`);
    (0, child_process_1.execSync)(`npx kill-port ${PORT}`);
    console.log(`Port ${PORT} is now free.`);
}
catch (err) {
    console.log(`Failed to kill process on port ${PORT} or no process found.`);
}
(0, index_1.default)()
    .then(() => {
    app_1.default.listen(PORT, ALLOWED_ORIGINS, () => {
        console.log(`🚀 Server is running at port: ${PORT}`);
        app_1.default.on("error", (error) => {
            console.log("❌ Error:", error);
            throw error;
        });
    });
})
    .catch((error) => {
    console.log("❌ MongoDB connection failed: " + error);
});
