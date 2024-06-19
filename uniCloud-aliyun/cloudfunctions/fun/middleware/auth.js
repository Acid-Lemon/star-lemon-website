const jwt = require("jsonwebtoken");
const config = require("uni-config-center")({
	pluginId: "fun"
}).config();

const error = require("../types/error");

module.exports = () => {
	return async function auth(ctx, next) {
		let public_vis = false;
		for (let prefix of config["CLOUD_FUNCTION_PUBLIC_PATH_PREFIX"]) {
			if (ctx.event.action.indexOf(prefix) === 0) {
				public_vis = true;
				break;
			}
		}
		if (public_vis) {
			await next();
			return;
		}

		let token = ctx.event.token;

		if (!token) {
			ctx.throw(error.codes.no_token, "no token for the api");
		}

		let auth_info;
		try {
			auth_info = jwt.verify(token.replace("Bearer ", ""), config.jwt_secret);
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError) {
				ctx.throw(error.codes.token_expire, "token expired. login again");
			}

			ctx.throw(error.codes.invalid_token, "invalid token");
		}

		console.log("auth_info:", auth_info);

		ctx.auth = auth_info;
		await next();
	}
}
