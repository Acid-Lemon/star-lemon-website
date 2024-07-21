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

    async get_personal_and_public_messages() {
        let {
            time_range = {},
            message_number
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
            }
        });

        if (time_range) {
            let now_time = Date.now();
            validate(time_range, {
                from_time: {
                    undefined_able: true,
                    null_able: true,

                    type: "number",
                    math: {
                        min: 0,
                        max: now_time
                    }
                },
                to_time: {
                    undefined_able: true,
                    null_able: true,

                    type: "number",
                    math: {
                        min: 0,
                        max: now_time
                    }
                }
            });
        }

        let messages = await this.service.message_board.get_personal_and_public_messages(message_number, time_range);
        return {
            data: {
                messages
            }
        };
    }
}
