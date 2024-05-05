const Router = require("uni-cloud-router").Router;
const router = new Router(require("./config"));

const error = require("./types/error");

exports.main = async (event, context) => {
	let res = await router.serve(event, context);
	console.info(res);

	if (res.success === false) {
		if (!res.customize) {
			res = {
				success: false,
				code: res.code,
				message: "error"
			};
		} else {
			delete res.customize;
		}
	}

	if (!res.hasOwnProperty("success")) {
		res = {
			success: false,
			code: error.codes.err_serve
		}
	}

	return res;
};
