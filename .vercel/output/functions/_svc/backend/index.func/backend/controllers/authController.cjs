const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');
const require__cjs_shim_backend_bcryptjs$1 = require('../../_virtual/_cjs-shim_backend_bcryptjs.cjs');
const require_User$1 = require('../models/User.cjs');
const require_uploadHelper$1 = require('../utils/uploadHelper.cjs');
const require_Tutor$1 = require('../models/Tutor.cjs');
const require__cjs_shim_backend_jsonwebtoken$1 = require('../../_virtual/_cjs-shim_backend_jsonwebtoken.cjs');

//#region controllers/authController.js
var require_authController = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports) => {
	const User = require_User$1.default;
	const Tutor = require_Tutor$1.default;
	const jwt = require__cjs_shim_backend_jsonwebtoken$1.default;
	require__cjs_shim_backend_mongoose$1.default;
	require__cjs_shim_backend_bcryptjs$1.default;
	const { getFileUrl } = require_uploadHelper$1.default;
	const generateToken = (id) => {
		return jwt.sign({ id }, process.env.JWT_SECRET || "tutorconnect_secret_key_123", { expiresIn: "30d" });
	};
	exports.registerTutor = async (req, res, next) => {
		try {
			const data = req.body || {};
			const { name, email, password, phone, mobile } = data;
			if (await User.findOne({ email })) return res.status(400).json({
				success: false,
				message: "Email already registered"
			});
			const user = await User.create({
				name: name || data.fullName,
				email,
				password,
				role: "Tutor"
			});
			let photoUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
			let certificateUrl = "";
			if (req.files && req.files["resume"] && req.files["resume"][0]) photoUrl = getFileUrl(req.files["resume"][0]);
			else if (req.file) photoUrl = getFileUrl(req.file);
			if (req.files && req.files["certificate"] && req.files["certificate"][0]) certificateUrl = getFileUrl(req.files["certificate"][0]);
			const parseIfJson = (val) => {
				if (!val) return [];
				if (Array.isArray(val)) return val;
				if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) try {
					return JSON.parse(val);
				} catch (e) {
					return [val];
				}
				return [val];
			};
			const tutor = await Tutor.create({
				userId: user._id,
				fullName: name || data.fullName,
				mobile: phone || mobile || "N/A",
				email,
				gender: data.gender,
				age: data.age ? Number(data.age) : void 0,
				qualification: data.degree || data.qualification,
				university: data.institution || data.university,
				graduationYear: data.passingYear ? Number(data.passingYear) : void 0,
				experience: data.experienceYears ? Number(data.experienceYears) : void 0,
				subjects: parseIfJson(data.subjects),
				classes: parseIfJson(data.classes),
				teachingMode: data.teachingMode || "Both",
				hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : void 0,
				monthlyRate: data.monthlyRate ? Number(data.monthlyRate) : void 0,
				streetAddress: data.streetAddress,
				city: data.city,
				state: data.state,
				pincode: data.pincode,
				lat: data.lat ? Number(data.lat) : void 0,
				lng: data.lng ? Number(data.lng) : void 0,
				bio: data.bio,
				photo: photoUrl,
				resumeUrl: photoUrl,
				certificateUrl
			});
			user.tutorProfile = tutor._id;
			await user.save();
			const token = generateToken(user._id);
			res.status(201).json({
				success: true,
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					tutorProfile: tutor._id
				}
			});
		} catch (err) {
			next(err);
		}
	};
	exports.login = async (req, res, next) => {
		try {
			const { email, password } = req.body;
			if (!email || !password) return res.status(400).json({
				success: false,
				message: "Please provide an email and password"
			});
			const user = await User.findOne({ email }).select("+password");
			if (!user) return res.status(401).json({
				success: false,
				message: "Invalid credentials"
			});
			if (!await user.matchPassword(password)) return res.status(401).json({
				success: false,
				message: "Invalid credentials"
			});
			const token = generateToken(user._id);
			res.status(200).json({
				success: true,
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					tutorProfile: user.tutorProfile
				}
			});
		} catch (err) {
			next(err);
		}
	};
	exports.getMe = async (req, res, next) => {
		try {
			const user = await User.findById(req.user._id).populate("tutorProfile");
			res.status(200).json({
				success: true,
				data: user
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
    return require_authController();
  }
});