const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_MessageBoard extends Service {
    async create_message(content) {
        let { id, create_at } = await this.service.db.message_board.create_message(content, this.ctx.auth.user_id, false);
        return {
            id,
            create_at,
            public_state: false
        }
    }

    async get_messages(message_number, start_time) {
       return start_time ? await this.service.db.message_board.get_messages(message_number, start_time) :
                           await this.service.db.message_board.get_messages(message_number);
    }
}
