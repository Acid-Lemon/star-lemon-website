const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

module.exports = class Controller_MessageBoard extends Controller {
    async create_message() {
        let { content } = validate(this.ctx.event.args, {
            content: {
                type: "string",
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
        let { start_time, message_number } = validate(this.ctx.event.args, {
            start_time: {
                undefined_able: true,
                null_able: true,
                type: "number",
                math: {
                    max: Date.now()
                }
            },
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
