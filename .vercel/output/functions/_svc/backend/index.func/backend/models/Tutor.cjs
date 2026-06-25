const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');

//#region models/Tutor.js
var require_Tutor = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const mongoose = require__cjs_shim_backend_mongoose$1.default;
	const TutorSchema = new mongoose.Schema({
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		fullName: {
			type: String,
			required: true
		},
		mobile: {
			type: String,
			required: true
		},
		email: { type: String },
		gender: { type: String },
		age: { type: Number },
		dateOfBirth: { type: Date },
		qualification: { type: String },
		university: { type: String },
		graduationYear: { type: Number },
		experience: { type: Number },
		previousInstitutions: {
			type: [String],
			default: []
		},
		methodology: { type: String },
		subjects: {
			type: [String],
			default: []
		},
		classes: {
			type: [String],
			default: []
		},
		competitiveExamCoaching: {
			type: Boolean,
			default: false
		},
		teachingMode: { type: String },
		preferredLocations: {
			type: [String],
			default: []
		},
		availableTimings: {
			type: [String],
			default: []
		},
		feeRange: { type: String },
		languages: {
			type: [String],
			default: []
		},
		bio: { type: String },
		resumeUrl: { type: String },
		photo: { type: String },
		certificateUrl: { type: String },
		leadsCount: {
			type: Number,
			default: 0
		},
		viewsCount: {
			type: Number,
			default: 0
		},
		streetAddress: { type: String },
		city: { type: String },
		state: { type: String },
		pincode: { type: String },
		lat: { type: Number },
		lng: { type: Number },
		hourlyRate: { type: Number },
		monthlyRate: { type: Number },
		isVerified: {
			type: Boolean,
			default: false
		},
		verifiedAt: { type: Date },
		verifiedDate: { type: Date }
	}, { timestamps: true });
	module.exports = mongoose.model("Tutor", TutorSchema);
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_Tutor();
  }
});