const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

module.exports = class Controller_MessageBoard extends Controller {
    async create_message() {
        let { content } = this.ctx.event.args;

        validate({content}, {
            content: {
                type: "string",
                not_null: true,
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        let res = await this.service.message_board.create_message(content)
        return {
            data: res
        };
    }

    async get_messages() {
        let { start_time, message_number } = this.ctx.event.args;

        if (start_time !== undefined && start_time !== null) {
            validate({start_time}, {
                start_time: {
                    type: "number",
                    math: {
                        max: Date.now()
                    }
                }
            });
        }

        validate({message_number}, {
            message_number: {
                type: "number",
                math: {
                    max: 20,
                    min: 1
                }
            }
        });

        let messages = await this.service.message_board.get_messages(message_number, start_time);
        return {
            data: {
                messages
            }
        };
    }
}
