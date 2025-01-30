const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

module.exports = class Controller_AI_assistant extends Controller {
    async get_answer() {
        let {
            message_list
        } = validate(this.ctx.event.args, {
            message_list: {
                type: "object",
            }
        });

        let channel = uniCloud.deserializeSSEChannel(this.ctx.event.args.channel);

        let res = await this.service.AI_assistant.get_answer(message_list, channel);

        return {
            data: res
        };
    }
};
