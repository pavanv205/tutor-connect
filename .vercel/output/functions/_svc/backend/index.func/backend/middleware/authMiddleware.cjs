const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');
const require_User$1 = require('../models/User.cjs');
const require__cjs_shim_backend_jsonwebtoken$1 = require('../../_virtual/_cjs-shim_backend_jsonwebtoken.cjs');

//#region middleware/authMiddleware.js
var require_authMiddleware = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	const jwt = require__cjs_shim_backend_jsonwebtoken$1.default;
	require__cjs_shim_backend_mongoose$1.default;
	const User = require_User$1.default;
	exports.protect = async (req, res, next) => {
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) token = req.headers.authorization.split(" ")[1];
		if (!token) {
			console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: 401 - Message: No token provided.`);
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this route. No token provided."
			});
		}
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET || "tutorconnect_secret_key_123");
			const user = await User.findById(decoded.id);
			if (!user) {
				console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: 401 - Message: User not found with ID ${decoded.id}.`);
				return res.status(401).json({
					success: false,
					message: "No user found with this id"
				});
			}
			req.user = user;
			next();
		} catch (err) {
			console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: 401 - Message: Invalid or expired token. Error: ${err.message}`);
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this route. Invalid or expired token."
			});
		}
	};
	exports.authorize = (...roles) => {
		return (req, res, next) => {
			if (!req.user || !roles.includes(req.user.role)) {
				console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: 403 - Message: Role '${req.user ? req.user.role : "Guest"}' is not authorized.`);
				return res.status(403).json({
					success: false,
					message: `User role '${req.user ? req.user.role : "Guest"}' is not authorized to access this route.`
				});
			}
			next();
		};
	};
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_authMiddleware();
  }
});