const Router = require("uni-cloud-router").Router;
const router = new Router(require("./config"));

const error = require("./types/api_error");

exports.main = async (event, context) => {
	// noinspection JSCheckFunctionSignatures - ide在uni-cloud-router压缩的情况下无法正确识别参数
	let res = await router.serve(event, context);
	console.info(res);

	if (res.success !== true) {
		if (!res.customize) {
			res = {
				success: false,
				code: res.code ?? error.codes.err_serve,
				message: "unknown error"
			};
		} else {
			delete res.customize;
		}
	}

	return res;
};
