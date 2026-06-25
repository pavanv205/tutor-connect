const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');

//#region models/StudentRequest.js
var require_StudentRequest = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const mongoose = require__cjs_shim_backend_mongoose$1.default;
	const StudentRequestSchema = new mongoose.Schema({
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: { type: String },
		queryType: {
			type: String,
			required: true
		},
		message: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: [
				"Pending",
				"Contacted",
				"Resolved"
			],
			default: "Pending"
		}
	}, { timestamps: true });
	module.exports = mongoose.model("StudentRequest", StudentRequestSchema);
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_StudentRequest();
  }
});