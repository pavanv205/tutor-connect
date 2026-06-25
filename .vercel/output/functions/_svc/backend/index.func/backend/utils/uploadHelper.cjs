const require_rolldown_runtime = require('../../_virtual/rolldown_runtime.cjs');
const require__cjs_shim_backend_multer$1 = require('../../_virtual/_cjs-shim_backend_multer.cjs');
const require__cjs_shim_backend_multer_storage_cloudinary$1 = require('../../_virtual/_cjs-shim_backend_multer-storage-cloudinary.cjs');
const require__cjs_shim_backend_cloudinary$1 = require('../../_virtual/_cjs-shim_backend_cloudinary.cjs');

//#region utils/uploadHelper.js
var require_uploadHelper = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const multer = require__cjs_shim_backend_multer$1.default;
	const { CloudinaryStorage } = require__cjs_shim_backend_multer_storage_cloudinary$1.default;
	const cloudinary = require__cjs_shim_backend_cloudinary$1.default.v2;
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET
	});
	const upload = multer({
		storage: new CloudinaryStorage({
			cloudinary,
			params: {
				folder: "tutor_profiles",
				allowed_formats: [
					"jpg",
					"png",
					"jpeg",
					"webp"
				]
			}
		}),
		limits: { fileSize: 10 * 1024 * 1024 }
	});
	const getFileUrl = (file) => {
		if (!file) return null;
		return file.path;
	};
	module.exports = {
		upload,
		getFileUrl
	};
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_uploadHelper();
  }
});