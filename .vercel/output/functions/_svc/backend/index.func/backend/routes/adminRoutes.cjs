const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_express$1 = require('../../_virtual/_cjs-shim_backend_express.cjs');
const require_authMiddleware$1 = require('../middleware/authMiddleware.cjs');
const require_adminController$1 = require('../controllers/adminController.cjs');

//#region routes/adminRoutes.js
var require_adminRoutes = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const router = require__cjs_shim_backend_express$1.default.Router();
	const { getDashboardStats, verifyTutor, adminUpdateTutor } = require_adminController$1.default;
	const { protect, authorize } = require_authMiddleware$1.default;
	router.use(protect);
	router.use(authorize("Admin"));
	router.get("/stats", getDashboardStats);
	router.put("/tutors/:id/verify", verifyTutor);
	router.put("/tutors/:id", adminUpdateTutor);
	module.exports = router;
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_adminRoutes();
  }
});