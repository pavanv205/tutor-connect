const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_express$1 = require('../../_virtual/_cjs-shim_backend_express.cjs');
const require_uploadHelper$1 = require('../utils/uploadHelper.cjs');
const require_authController$1 = require('../controllers/authController.cjs');
const require_authMiddleware$1 = require('../middleware/authMiddleware.cjs');

//#region routes/authRoutes.js
var require_authRoutes = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const router = require__cjs_shim_backend_express$1.default.Router();
	const { upload } = require_uploadHelper$1.default;
	const { registerTutor, login, getMe } = require_authController$1.default;
	const { protect } = require_authMiddleware$1.default;
	router.post("/register", upload.fields([{
		name: "resume",
		maxCount: 1
	}, {
		name: "certificate",
		maxCount: 1
	}]), registerTutor);
	router.post("/login", login);
	router.get("/me", protect, getMe);
	module.exports = router;
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_authRoutes();
  }
});