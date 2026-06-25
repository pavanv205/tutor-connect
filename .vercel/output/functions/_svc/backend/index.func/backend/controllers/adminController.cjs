const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');
const require_User$1 = require('../models/User.cjs');
const require_Tutor$1 = require('../models/Tutor.cjs');
const require_StudentRequest$1 = require('../models/StudentRequest.cjs');

//#region controllers/adminController.js
var require_adminController = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	const Tutor = require_Tutor$1.default;
	require_User$1.default;
	require__cjs_shim_backend_mongoose$1.default;
	exports.getDashboardStats = async (req, res, next) => {
		try {
			const StudentRequest = require_StudentRequest$1.default;
			const totalTutors = await Tutor.countDocuments();
			const verifiedTutors = await Tutor.countDocuments({ isVerified: true });
			const pendingTutors = await Tutor.countDocuments({ isVerified: false });
			const totalRequests = await StudentRequest.countDocuments();
			const pendingRequests = await StudentRequest.countDocuments({ status: "Pending" });
			const contactedRequests = await StudentRequest.countDocuments({ status: "Contacted" });
			const resolvedRequests = await StudentRequest.countDocuments({ status: "Resolved" });
			res.status(200).json({
				success: true,
				data: {
					tutors: {
						total: totalTutors,
						verified: verifiedTutors,
						pending: pendingTutors
					},
					bookings: {
						total: totalRequests,
						pending: pendingRequests,
						contacted: contactedRequests,
						assigned: resolvedRequests
					}
				}
			});
		} catch (err) {
			next(err);
		}
	};
	exports.verifyTutor = async (req, res, next) => {
		try {
			const { isVerified } = req.body;
			const targetStatus = isVerified !== void 0 ? isVerified : true;
			const updateData = {
				isVerified: targetStatus,
				verifiedAt: targetStatus ? /* @__PURE__ */ new Date() : null,
				verifiedDate: targetStatus ? /* @__PURE__ */ new Date() : null
			};
			const tutor = await Tutor.findByIdAndUpdate(req.params.id, updateData, { new: true });
			if (!tutor) return res.status(404).json({
				success: false,
				message: "Tutor not found"
			});
			res.status(200).json({
				success: true,
				message: `Tutor verification status set to: ${tutor.isVerified}`,
				data: tutor
			});
		} catch (err) {
			next(err);
		}
	};
	exports.adminUpdateTutor = async (req, res, next) => {
		try {
			const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true
			});
			if (!tutor) return res.status(404).json({
				success: false,
				message: "Tutor not found"
			});
			res.status(200).json({
				success: true,
				data: tutor
			});
		} catch (err) {
			next(err);
		}
	};
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_adminController();
  }
});