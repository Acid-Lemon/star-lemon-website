const jwt = require("jsonwebtoken");
const jwt_secret = require("uni-config-center")({
	pluginId: "fun"
}).config("JWT_SECRET");

const error = require("../types/error");

module.exports = () => {
	return async function auth(ctx, next) {
		let token = ctx.event.token;
		if (!token) {
			if (ctx.event.action.indexOf("login") === -1) {
				ctx.throw(error.codes.no_token, "no token for the api");
			}

			await next();
			return;
		}

		let auth_info;
		try {
			auth_info = jwt.verify(token.replace("Bearer ", ""), jwt_secret);
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
