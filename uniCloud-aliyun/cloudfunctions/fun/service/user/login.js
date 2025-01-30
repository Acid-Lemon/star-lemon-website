const {
	Service
} = require("uni-cloud-router");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const email_send = require("../../utils/email_send");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const error = require("../../types/api_error");

module.exports = class Service_User_Login extends Service {
	create_code() {
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += Math.floor(Math.random() * 10).toString();
		}

		return code;
	}

	async send_email_code(email, code, mode)  {
		let info = await email_send.send_email_code(email, code, mode);
		console.log("email verify code send info:", info);
	}

	async compare_password(password, hash) {
		return await bcrypt.compare(password, hash);
	}

	create_token(user) {
		return "Bearer " + jwt.sign({
			user_id: user.id
		}, config["JWT_SECRET"]);
	}

	async create_user(info) {
		if (!info instanceof Object) {
			throw TypeError("create_user: info is not an object");
		}

		info.hash = await bcrypt.hash(info.password, 10);
		delete info.password;

		return await this.service.db.user.create_user(info);
	}

	verify_email_code(code, code_record) {
		if (Date.now() - code_record.create >= config["EMAIL_CODE_EXP_MINUTE"] * 1000 * 60) {
			this.throw(error.codes.email_code_expire, "the code is invalid. send a new one again.");
		}


		if (code !== code_record.code) {
			this.throw(error.codes.invalid_email_code, "the code is invalid. send a new one again.");
		}
	}
};
