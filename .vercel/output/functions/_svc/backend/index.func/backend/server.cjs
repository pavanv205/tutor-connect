const require__cjs_shim_backend_express$1 = require('../_virtual/_cjs-shim_backend_express.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../_virtual/_cjs-shim_backend_mongoose.cjs');
const require__cjs_shim_backend_cors$1 = require('../_virtual/_cjs-shim_backend_cors.cjs');
const require_User$1 = require('./models/User.cjs');
const require_authRoutes$1 = require('./routes/authRoutes.cjs');
const require_adminRoutes$1 = require('./routes/adminRoutes.cjs');
const require_tutorRoutes$1 = require('./routes/tutorRoutes.cjs');
const require_studentRequestRoutes$1 = require('./routes/studentRequestRoutes.cjs');

//#region server.js
const express = require__cjs_shim_backend_express$1.default;
const mongoose = require__cjs_shim_backend_mongoose$1.default;
const cors = require__cjs_shim_backend_cors$1.default;
const dotenv = require("dotenv");
const path = require("node:path");
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = process.env.PORT || 5e3;
const requiredVars = ["MONGODB_URI"];
const recommendedVars = ["JWT_SECRET"];
requiredVars.forEach((varName) => {
	if (!process.env[varName]) console.warn(`⚠️  WARNING: Required environment variable ${varName} is not set.`);
});
recommendedVars.forEach((varName) => {
	if (!process.env[varName]) console.warn(`⚠️  WARNING: Recommended environment variable ${varName} is not set. Using insecure default.`);
});
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
mongoose.set("bufferCommands", false);
mongoose.connection.on("error", (err) => {
	console.log("Mongoose connection background error:", err.message);
});
let dbConnectionPromise = null;
const connectDB = () => {
	if (dbConnectionPromise) return dbConnectionPromise;
	const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tutorconnect";
	dbConnectionPromise = mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5e3,
		socketTimeoutMS: 1e4
	}).then(async () => {
		console.log("MongoDB Connected Successfully");
		try {
			const User = require_User$1.default;
			if (!await User.findOne({ role: "Admin" })) {
				await User.create({
					name: "System Admin",
					email: "admin@tutorconnect.com",
					password: "adminpassword123",
					role: "Admin"
				});
				console.log("ℹ️ Default Admin Account Seeded:");
				console.log("   Email: admin@tutorconnect.com");
				console.log("   Password: adminpassword123");
				console.log("=========================================");
			}
		} catch (seedErr) {
			console.error("Admin seeding failed:", seedErr.message);
		}
	}).catch((err) => {
		console.log("MongoDB Connection Failed");
		console.error(err.message);
		process.exit(1);
	});
	return dbConnectionPromise;
};
connectDB();
app.get("/api/health", async (req, res) => {
	try {
		const dbState = mongoose.connection.readyState;
		const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
		res.status(200).json({
			status: "ok",
			database: dbStatus
		});
	} catch (err) {
		console.error("[API ERROR] Health check error:", err);
		res.status(500).json({
			status: "error",
			database: "disconnected",
			message: err.message
		});
	}
});
const authRoutes = require_authRoutes$1.default;
const adminRoutes = require_adminRoutes$1.default;
const tutorRoutes = require_tutorRoutes$1.default;
const studentRequestRoutes = require_studentRequestRoutes$1.default;
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/student-requests", studentRequestRoutes);
app.use((err, req, res, next) => {
	const isAuthError = err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.status === 401 || err.status === 403;
	const isDatabaseError = err.name === "ValidationError" || err.code === 11e3 || err.name.includes("Mongo") || err.message.includes("Mongoose") || err.message.includes("Mongo");
	if (isAuthError) console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 401} - Message: ${err.message}`);
	else if (isDatabaseError) console.error(`[DATABASE ERROR] ${req.method} ${req.originalUrl} - Message: ${err.message}`);
	else console.error(`[API SYSTEM ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 500} - Message: ${err.message}`);
	console.error("Stack:", err.stack);
	if (err.name === "ValidationError") {
		const messages = Object.values(err.errors).map((e) => e.message);
		return res.status(400).json({
			success: false,
			message: messages.join(", ")
		});
	}
	if (err.code === 11e3) return res.status(400).json({
		success: false,
		message: "Duplicate field value entered"
	});
	if (err.name === "JsonWebTokenError") return res.status(401).json({
		success: false,
		message: "Invalid token"
	});
	if (err.name === "TokenExpiredError") return res.status(401).json({
		success: false,
		message: "Token expired"
	});
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Server Error"
	});
});
if (!process.env.VERCEL) app.listen(PORT, () => {
	console.log(`Backend server running on port ${PORT}`);
});
module.exports = app;

//#endregion