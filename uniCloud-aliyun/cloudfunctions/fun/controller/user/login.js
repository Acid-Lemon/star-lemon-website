const {
	Controller
} = require("uni-cloud-router");

const error = require("../../types/api_error");

const {
	validate
} = require("../../utils/args_check");

module.exports = class Controller_User_Login extends Controller {
	async register_by_user() {
		let {
			username,
			password
		} = validate(this.ctx.event.args, {
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

		let user = await this.service.user.login.create_user({
			name: username,
			password
		});

		return {
			data: user
		};
	}

	async register_by_email() {
		let {
			email,
			code,
			password,
			username
		} = validate(this.ctx.event.args, {
			email: {
				type: "string",
				regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

		let code_record = await this.service.db.email_code.find_code(email);
		console.info("code_record: ", code_record);

		if (!code_record) {
			this.throw(error.codes.no_email_code, "no email code. please send first");
		}

		this.service.user.login.verify_email_code(code, code_record);

		let user = await this.service.user.login.create_user({
			email,
			name: username,
			password
		});

		await this.service.db.email_code.delete_code_by_id(code_record.id);

		return {
			data: user
		};
	}

	async login_by_user() {
		let {
			username,
			password
		} = validate(this.ctx.event.args, {
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

	async login_by_email() {
		let {
			email,
			code
		} = validate(this.ctx.event.args, {
			email: {
				type: "string",
				regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			},
			code: {
				type: "string"
			}
		});

		let code_record = await this.service.db.email_code.find_code(email);
		console.info("code_record: ", code_record);

		if (!code_record) {
			this.throw(error.codes.no_email_code, "email code not found");
		}

		if (code !== code_record.code) {
			this.throw(error.codes.invalid_email_code, "email code wrong");
		}

		let user = await this.service.db.user.find_user_by_email(email);
		if (!user) {
			this.throw(error.codes.no_user, "user not found");
		}

		await this.service.db.email_code.delete_code_by_id(code_record.id);

		return {
			token: this.service.user.login.create_token(user)
		};
	}

	async send_email_code() {
		let {
			email,
			mode
		} = validate(this.ctx.event.args, {
			email: {
				type: "string",
				regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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
		let id = await this.service.db.email_code.update_code_with_limit(code, email);
		try {
			await this.service.user.login.send_email_code(email, code, mode);
		} catch (err) {
			await this.service.db.email_code.delete_code_last_send_record(id);
		}

		return {};
	}
};
