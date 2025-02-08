const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_OnlineTools extends Service {
    async get_online_tools() {
        return await this.service.db.online_tools.get_online_tools()
    }

    async add_online_tool(name, url) {
        return await this.service.db.online_tools.add_online_tool(name, url, this.ctx.user.id)
    }

    async delete_online_tool(tool_id) {
        return await this.service.db.online_tools.delete_online_tool(tool_id, this.ctx.user.id)
    }
}
