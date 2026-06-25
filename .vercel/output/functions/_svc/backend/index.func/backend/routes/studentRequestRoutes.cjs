const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_express$1 = require('../../_virtual/_cjs-shim_backend_express.cjs');
const require_authMiddleware$1 = require('../middleware/authMiddleware.cjs');
const require_studentRequestController$1 = require('../controllers/studentRequestController.cjs');

//#region routes/studentRequestRoutes.js
var require_studentRequestRoutes = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const router = require__cjs_shim_backend_express$1.default.Router();
	const studentRequestController = require_studentRequestController$1.default;
	const { protect, authorize } = require_authMiddleware$1.default;
	router.post("/", studentRequestController.createStudentRequest);
	router.get("/", protect, authorize("Admin"), studentRequestController.getStudentRequests);
	router.put("/:id/status", protect, authorize("Admin"), studentRequestController.updateStatus);
	module.exports = router;
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_studentRequestRoutes();
  }
});