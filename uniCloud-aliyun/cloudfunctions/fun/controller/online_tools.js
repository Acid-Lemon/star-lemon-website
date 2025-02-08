const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

module.exports = class Controller_OnlineTools extends Controller {
    async get_online_tools() {
        let tools = await this.service.online_tools.get_online_tools();
        return {
            data: {
                tools
            }
        };
    }

    async add_online_tool() {
        let {
            name,
            url
        } = validate(this.ctx.event.args, {
            name: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            },
            url: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        return await this.service.online_tools.add_online_tool(name, url);
    }

    async delete_online_tool() {
        let {
            tool_id
        } = validate(this.ctx.event.args, {
            tool_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        return await this.service.online_tools.delete_online_tool(tool_id);
    }
}
