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

    async update_profile() {
        let new_information = validate(this.ctx.event.args, {
            name: {
                undefined_able: true,
                type: "string",
                length: {
                    max: 20,
                    min: 1
                }
            },
            birthday: {
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
                undefined_able: true,
                type: "string",
                length: {
                    max: 100
                }
            }
        });

        // 可能只传入要更改的属性，如果没有validate会给出该字段值为undefined，需要删除
        for (let [key, value] of Object.entries(new_information)) {
            if (value === undefined) {
                delete new_information[key];
            }
        }

        await this.service.db.user.update_user(this.ctx.auth.user_id, new_information);

        return {
            data: null
        };
    }
}
