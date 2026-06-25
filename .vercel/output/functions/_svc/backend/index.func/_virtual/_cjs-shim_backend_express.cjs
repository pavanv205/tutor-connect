const require_rolldown_runtime = require('./rolldown_runtime.cjs');
let node_module = require("node:module");
let node_url = require("node:url");
let node_path = require("node:path");

//#region \0cjs-shim:backend_express
var require__cjs_shim_backend_express = /* @__PURE__ */ require_rolldown_runtime.__commonJSMin(((exports, module) => {
	const requireFromContext = (0, node_module.createRequire)((0, node_path.join)((0, node_path.dirname)((0, node_url.fileURLToPath)(require("url").pathToFileURL(__filename).href)), "..\backendpackage.json"));
	module.exports = requireFromContext("express");
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require__cjs_shim_backend_express();
  }
});