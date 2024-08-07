const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../../utils/args_check");

module.exports = class Controller_User_Info extends Controller {
    async get_info() {
        return {
            data: {
                user: await this.service.user.info.get_info()
            }
        };
    }

    async update_basic_info() {
        let new_basic_info = validate(this.ctx.event.args, {
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
                length: {
                    max: 50
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

        for (let [key, value] of Object.entries(new_basic_info)) {
            if (value === null || value === undefined) {
                delete new_basic_info[key];
            }
        }

        await this.service.db.user.update_user(this.ctx.auth.user_id, new_basic_info);

        return {
            data: null
        };
    }
}
