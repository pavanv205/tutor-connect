const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_express$1 = require('../../_virtual/_cjs-shim_backend_express.cjs');
const require_uploadHelper$1 = require('../utils/uploadHelper.cjs');
const require_tutorController$1 = require('../controllers/tutorController.cjs');

//#region routes/tutorRoutes.js
var require_tutorRoutes = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const router = require__cjs_shim_backend_express$1.default.Router();
	const { upload } = require_uploadHelper$1.default;
	const tutorController = require_tutorController$1.default;
	router.post("/", upload.fields([{
		name: "resume",
		maxCount: 1
	}, {
		name: "certificate",
		maxCount: 1
	}]), tutorController.createTutor);
	router.get("/", tutorController.getTutors);
	router.get("/:id", tutorController.getTutorById);
	router.put("/:id", upload.fields([{
		name: "resume",
		maxCount: 1
	}, {
		name: "certificate",
		maxCount: 1
	}]), tutorController.updateTutor);
	router.delete("/:id", tutorController.deleteTutor);
	module.exports = router;
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_tutorRoutes();
  }
});