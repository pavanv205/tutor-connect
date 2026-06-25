const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_mongoose$1 = require('../../_virtual/_cjs-shim_backend_mongoose.cjs');
const require__cjs_shim_backend_bcryptjs$1 = require('../../_virtual/_cjs-shim_backend_bcryptjs.cjs');

//#region models/User.js
var require_User = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const mongoose = require__cjs_shim_backend_mongoose$1.default;
	const bcrypt = require__cjs_shim_backend_bcryptjs$1.default;
	const UserSchema = new mongoose.Schema({
		name: {
			type: String,
			required: [true, "Please add a name"]
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
			lowercase: true,
			trim: true
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: 6,
			select: false
		},
		role: {
			type: String,
			enum: ["Admin", "Tutor"],
			default: "Tutor"
		},
		tutorProfile: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Tutor"
		}
	}, { timestamps: true });
	UserSchema.pre("save", async function(next) {
		if (!this.isModified("password")) return next();
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	});
	UserSchema.methods.matchPassword = async function(enteredPassword) {
		return await bcrypt.compare(enteredPassword, this.password);
	};
	module.exports = mongoose.model("User", UserSchema);
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_User();
  }
});