const {
    Controller
} = require("uni-cloud-router");

const {
    validate,
    validate_time_range
} = require("../utils/args_check");

const {
    codes
} = require("../types/api_error");

module.exports = class Controller_MessageBoard extends Controller {
    async create_message() {
        let {content} = validate(this.ctx.event.args, {
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

    async get_all_messages_admin(review) {
        let {
            time_range = {},
            message_number,
            skip_number = 0,
            type
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
            },

            type: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        let messages = await this.service.message_board.get_all_messages_admin(message_number, time_range, skip_number, type);
        return {
            data: {
                messages
            }
        };
    }

    async delete_message() {
        let {
            message_id
        } = validate(this.ctx.event.args, {
            message_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        if (await this.service.message_board.check_permissions_to_delete_message(message_id)) {
            let res = await this.service.message_board.delete_message(message_id);
            return {
                data: res
            }
        } else {
            this.throw(codes.err_no_permissions, "No permission to delete message");
        }
    }

    async verify_message() {
        let {
            message_id,
            public_state
        } = validate(this.ctx.event.args, {
            message_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            },
            public_state: {
                type: "boolean"
            }
        });

        if (await this.service.message_board.check_permissions_to_verify_message()) {
            let res = await this.service.message_board.verify_message(message_id, public_state);
            return {
                data: res
            }
        } else {
            this.throw(codes.err_no_permissions, "No permission to verify message");
        }
    }
}
