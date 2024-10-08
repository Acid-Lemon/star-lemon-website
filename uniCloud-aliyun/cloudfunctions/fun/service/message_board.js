const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_MessageBoard extends Service {
    async create_message(content) {
        let {id, create_at} = await this.service.db.message_board.create_message(content, this.ctx.auth.user_id, false);
        return {
            id,
            create_at,
            public_state: false,
            review: false
        }
    }

    async get_personal_and_public_messages(message_number, time_range = {}, skip_numbers = 0) {
        time_range = time_range ?? {};
        return await this.service.db.message_board.get_personal_and_public_messages(message_number, time_range, skip_numbers)
    }

    async get_all_messages_admin(message_number, time_range = {}, skip_numbers = 0, type = "all") {
        time_range = time_range ?? {};
        return await this.service.db.message_board.get_all_messages_admin(message_number, time_range, skip_numbers, type)
    }

    async change_message_public_state(message_id, public_state) {
        return await this.service.db.message_board.change_message_public_state(message_id, public_state);
    }

    async check_permissions(type, message_id) {
        if (type === "delete_article") {
            return this.ctx.user.role === "admin"
                || await this.service.db.message_board.find_user_id_by_message_id(message_id) === this.ctx.user.id
        } else if (type === "change_message_public_state") {
            return this.ctx.user.role === "admin"
        }
    }

    async delete_message(message_id) {
        return await this.service.db.message_board.delete_message(message_id);
    }
}
