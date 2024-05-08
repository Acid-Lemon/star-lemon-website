const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_User_Info extends Service {
    async get_info() {
        return await this.service.db.user.find_user_by_id(this.ctx.auth.user_id);
    }
}
