const {
	Service
} = require("uni-cloud-router");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const error = require("../../types/error");

module.exports = class Service_User_Login extends Service {
	create_code() {
		let code = "";
		for (let i = 0; i < 6; i++) {
			code = code + Math.floor(Math.random() * 10).toString();
		}

		return code;
	}

	async send_code(phone_number, code, mode) {
		let res = await uniCloud.sendSms({
			appid: config["UNIAPP_ID"],
			phone: phone_number,
			templateId: config["UNICLOUD_SMS_TEMPLATE_ID"],
			data: {
				mode,
				code,
				exp_minute: config["UNICLOUD_SMS_EXP_MINUTE"]
			}
		});

		console.log(res);

		return res;
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

	verify_code(code, code_record) {
		if (Date.now() - code_record.create >= config["UNICLOUD_SMS_EXP_MINUTE"] * 1000 * 60) {
			this.throw(error.codes.sms_code_expire, "the code is invalid. send a new one again.");
		}


		if (code !== code_record.code) {
			this.throw(error.codes.invalid_sms_code, "the code is invalid. send a new one again.");
		}
	}
};
