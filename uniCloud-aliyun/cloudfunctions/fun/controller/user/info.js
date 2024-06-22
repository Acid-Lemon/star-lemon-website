const {
    Controller
} = require("uni-cloud-router");

module.exports = class Controller_User_Info extends Controller {
    async get_info() {
        return {
            data: {
                user: await this.service.user.info.get_info()
            }
        };
    }

    async update_basic_info() {
    }
}
