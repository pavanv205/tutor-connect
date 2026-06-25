const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require_StudentRequest$1 = require('../models/StudentRequest.cjs');

//#region controllers/studentRequestController.js
var require_studentRequestController = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	const StudentRequest = require_StudentRequest$1.default;
	exports.createStudentRequest = async (req, res, next) => {
		try {
			const { name, email, queryType, message } = req.body;
			if (!name || !email || !queryType || !message) return res.status(400).json({
				success: false,
				message: "Please provide all required fields"
			});
			const newRequest = await StudentRequest.create({
				name,
				email,
				queryType,
				message
			});
			res.status(201).json({
				success: true,
				data: newRequest,
				message: "Your message has been received! Our support representative will email you shortly."
			});
		} catch (err) {
			next(err);
		}
	};
	exports.getStudentRequests = async (req, res, next) => {
		try {
			const requests = await StudentRequest.find().sort({ createdAt: -1 });
			res.status(200).json({
				success: true,
				data: requests
			});
		} catch (err) {
			next(err);
		}
	};
	exports.updateStatus = async (req, res, next) => {
		try {
			const { status } = req.body;
			const request = await StudentRequest.findByIdAndUpdate(req.params.id, { status }, {
				new: true,
				runValidators: true
			});
			if (!request) return res.status(404).json({
				success: false,
				message: "Student request not found"
			});
			res.status(200).json({
				success: true,
				data: request
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
    return require_studentRequestController();
  }
});