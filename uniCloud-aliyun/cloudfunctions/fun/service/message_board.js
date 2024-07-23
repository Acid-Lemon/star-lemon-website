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

    async get_personal_and_public_messages(message_number, time_range={}, skip_numbers = 0) {
        time_range = time_range ?? {};
        return await this.service.db.message_board.get_personal_and_public_messages(message_number, time_range, skip_numbers)
    }
}
