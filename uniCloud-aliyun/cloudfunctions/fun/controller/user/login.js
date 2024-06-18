const {
	Controller
} = require("uni-cloud-router");

const error = require("../../types/error");

const {
	validate
} = require("../../utils/args_check");

module.exports = class Controller_User_Login extends Controller {
	async register_by_user() {
		let {
			username,
			password
		} = this.ctx.event.args;

		validate({
			username,
			password
		}, {
			username: {
				type: "string",
				length: {
					max: 20,
					min: 2
				}
			},
			password: {
				type: "string",
				length: {
					max: 30,
					min: 5
				}
			}
		});

		let exist_user = await this.service.db.user.find_user_by_name(username);
		if (exist_user) {
			this.throw(error.codes.exist_user_name, "username already exists");
		}

		let user = await this.service.user.login.create_user({
			name: username,
			password
		});

		return {
			data: user
		};
	}

	async register_by_sms() {
		let {
			username,
			password,
			phone_number,
			code
		} = this.ctx.event.args;

		validate({
			phone_number,
			code,
			username,
			password
		}, {
			phone_number: {
				type: "string",
				regex: /^1[3456789]\d{9}$/
			},
			code: {
				type: "string",
				not_null: true
			},
			username: {
				type: "string",
				length: {
					max: 20,
					min: 2
				}
			},
			password: {
				type: "string",
				length: {
					max: 30,
					min: 5
				}
			}
		});

		let code_record = await this.service.db.user.find_code(phone_number);
		console.info("code_record: ", code_record);

		this.service.user.login.verify_code(code, code_record);

		let user = await this.service.user.login.create_user({
			phone_number,
			username,
			password
		});

		return {
			data: user
		};
	}

	async login_by_user() {
		let {
			username,
			password
		} = this.ctx.event.args;

		validate({
			username,
			password
		}, {
			username: {
				type: "string",
				not_null: true
			},
			password: {
				type: "string",
				not_null: true
			}
		});

		let user = await this.service.db.user.find_user_by_name(username);

		if (!user) {
			this.throw(error.codes.no_user, "user not found");
		}

		if (!await this.service.user.login.compare_password(password, user.hash)) {
			this.throw(error.codes.invalid_password, "password wrong");
		}

		return {
			token: this.service.user.login.create_token(user)
		};
	}

	async login_by_sms() {
		let {
			phone_number,
			code
		} = this.ctx.event.args;

		validate({
			phone_number,
			code
		}, {
			phone_number: {
				type: "string",
				regex: /^1[3456789]\d{9}$/
			},
			code: {
				type: "string",
				not_null: true
			}
		});

		let code_record = await this.service.db.user.find_code(phone_number);
		console.info("code_record: ", code_record);

		if (!code_record) {
			this.throw(error.codes.no_sms_code, "sms code not found");
		}

		if (code !== code_record.code) {
			this.throw(error.codes.invalid_sms_code, "sms code wrong");
		}

		let user = await this.service.db.user.find_user_by_phone_number(phone_number);
		if (!user) {
			this.throw(error.codes.no_user, "user not found");
		}

		return {
			token: this.service.user.login.create_token(user)
		};
	}

	async send_code() {
		let {
			phone_number,
			mode
		} = this.ctx.event.args;
		validate({
			phone_number,
			mode
		}, {
			phone_number: {
				type: "string",
				regex: /^1[3456789]\d{9}$/
			},
			mode: {
				type: "string",
				not_null: true,
				customize: (args, name) => {
					return args[name] === "登录" || args[name] === "注册";
				}
			}
		});

		let code = this.service.user.login.create_code();
		await this.service.user.login.send_code(phone_number, code, mode);

		await this.service.db.sms_code.store_code(code, phone_number);

		return {};
	}
};
