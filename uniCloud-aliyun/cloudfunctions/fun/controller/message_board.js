const {
    Controller
} = require("uni-cloud-router");

const {
    validate,
    validate_time_range
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

    async get_personal_and_public_messages() {
        let {
            time_range = {},
            message_number,
            skip_number = 0
        } = validate(this.ctx.event.args, {
            time_range: {
                undefined_able: true,
                null_able: true,
                type: "object"
            },

            message_number: {
                type: "number",
                math: {
                    max: 20,
                    min: 1
                }
            },

            skip_number: {
                undefined_able: true,
                null_able: true,
                type: "number",

                math: {
                    min: 0,
                    max: 200
                }
            }
        });

        validate_time_range(time_range);

        let messages = await this.service.message_board.get_personal_and_public_messages(message_number, time_range, skip_number);
        return {
            data: {
                messages
            }
        };
    }
}
