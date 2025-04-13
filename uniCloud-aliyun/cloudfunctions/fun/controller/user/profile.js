const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../../utils/args_check");

const time_util = require("../../utils/common/time");

module.exports = class Controller_User_Profile extends Controller {
    async get_profile() {
        return {
            data: {
                profile: await this.service.user.profile.get_profile()
            }
        };
    }

    async get_upload_avatar_temp_url() {
        let {
            image_name
        } = validate(this.ctx.event.args, {
            image_name: {
                type: "string"
            }
        });

        let temp_url = await this.service.cloud_storage.profile.get_upload_avatar_temp_url(image_name);
        return {
            data: {
                temp_url
            }
        };
    }

    async get_upload_background_image_temp_url() {
        let {
            image_name
        } = validate(this.ctx.event.args, {
            image_name: {
                type: "string"
            }
        });

        let temp_url = await this.service.cloud_storage.profile.get_upload_background_image_temp_url(image_name);
        return {
            data: {
                temp_url
            }
        };
    }

    async create_upload_avatar() {
        let {
            image_type
        } = validate(this.ctx.event.args, {
            image_type: {
                type: "string",
                within: ["jpg", "jpeg", "png", "gif"]
            }
        });

        let { upload_options } = await this.service.user.profile.create_upload_avatar(image_type);
        return {
            data: upload_options
        };
    }

    async choose_local_avatar() {
        let {
            image_name
        } = validate(this.ctx.event.args, {
            image_name: {
                type: "string",
                regex: /^[1-9][0-9]?|[1-9].jpg$/
            }
        });

        await this.service.user.profile.choose_local_avatar(image_name);

        return {
            data: null
        };
    }

    async create_background_image() {
        let {
            image_type
        } = validate(this.ctx.event.args, {
            image_type: {
                type: "string",
                within: ["jpg", "jpeg", "png", "gif"]
            }
        });

        let { upload_options } = await this.service.user.profile.create_background_image(image_type);

        return {
            data: upload_options
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
            }
        });

        let code = this.service.user.login.create_code();
        await this.service.db.email_code.update_code_with_limit(code, email);
        await this.service.user.login.send_email_code(email, code, mode);

        return {};
    }

    async update_profile() {
        let new_information = validate(this.ctx.event.args, {
            name: {
                null_able: true,
                undefined_able: true,

                type: "string",
                length: {
                    max: 20,
                    min: 1
                }
            },
            birthday: {
                null_able: true,
                undefined_able: true,

                type: "string",
                regex: /^(\d{4})年(0[1-9]|1[0-2])月(0[1-9]|[12][0-9]|3[01])日$/,
                customize: (args, name) => {
                    let birthday_str = args[name];
                    let [year, month, day] = birthday_str.split(/[年月日]/).map((str) => parseInt(str));

                    if (month === 2) {
                        let add_day = time_util.is_leap_year(year) ? 1 : 0;
                        if (day > 28 + add_day) {
                            return false;
                        }
                    } else if ([4, 6, 9, 11].includes(month)) {
                        if (day > 30) {
                            return false;
                        }
                    }

                    return true;
                }
            },
            personal_sign: {
                null_able: true,
                undefined_able: true,

                type: "string",
                length: {
                    max: 100
                }
            },
            email: {
                null_able: true,
                undefined_able: true,

                type: "string",
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
        });

        // 可能只传入要更改的属性，如果没有validate会给出该字段值为undefined，需要删除
        for (let [key, value] of Object.entries(new_information)) {
            if (value === undefined) {
                delete new_information[key];
            }
        }

        if (Object.hasOwn(new_information, "email")) {
            let code = await this.service.db.email_code.find_email_code(new_information.email);
            if (!code) {
                this.throw(errors.codes.no_email_code, "email code not found");
            }

            let code_record = await this.service.db.email_code.find_email_code(new_information.email);
            await this.service.user.login.verify_email_code(new_information.code, code_record);

            await this.service.db.email_code.delete_email_code(new_information.email);
        }

        await this.service.db.user.update_user(this.ctx.auth.user_id, new_information);

        return {
            data: null
        };
    }
}
