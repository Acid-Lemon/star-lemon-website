const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_MessageBoard extends Service {
    async create_message(content) {
        return await this.service.db.message_board.create_message(content, this.ctx.auth.user_id, false);
    }

    async get_messages(message_number, start_time) {
       return start_time ? await this.service.db.message_board.get_messages(message_number, start_time) :
                           await this.service.db.message_board.get_messages(message_number);
    }
}
