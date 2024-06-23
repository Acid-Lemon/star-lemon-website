const {
    Controller
} = require("uni-cloud-router");
const {validate} = require("@/uniCloud-aliyun/cloudfunctions/fun/utils/args_check");

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
                max_length: 20,
                min_length: 1
            },
            birthday: {
                undefined_able: true,
                type: "string",
                max_length: 50,
            },
            personal_sign: {
                undefined_able: true,
                type: "string",
                max_length: 100,
            }
        });

        await this.service.db.user.update_user(this.ctx.auth.user_id, new_basic_info);

        return {
            data: null
        };
    }
}
