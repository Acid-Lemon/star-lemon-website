const {
    Controller
} = require("uni-cloud-router");

const lodash = require("lodash");

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
                customize: (args, name) => {
                    let arg = args[name];
                    for (let i of arg) {
                        if (!lodash.isEqual(Object.keys(i), ["role", "content"])) {
                            return false;
                        }
                        switch (i["role"]) {
                            case "user": {
                                if (i["content"].length > 500) {
                                    return false;
                                }
                                break;
                            }
                            case "assistant": {
                                if (i["content"].length > 2000) {
                                    return false;
                                }
                                break;
                            }
                            case "system": {
                                if (i["content"].length > 1500) {
                                    return false;
                                }
                                break;
                            }
                            default: {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
        });

        let channel = uniCloud.deserializeSSEChannel(this.ctx.event.args.channel);

        let res = await this.service.AI_assistant.get_answer(message_list, channel);

        return {
            data: res
        };
    }
};
