const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

module.exports = class DBService_OnlineTools extends Service {
    async get_online_tools() {
        return (await this.db.collection(tables.online_tools).aggregate()
            .sort({
                create_at: -1
            })
            .lookup({
                from: tables.user,
                let: {
                    user_id: "$user_id"
                },
                pipeline: this.db.command.aggregate.pipeline()
                    .match(this.db.command.expr(
                        this.db.command.eq(["$_id", "$$user_id"])
                    ))
                    .project({
                        id: "$_id",
                        _id: false,
                        name: true,
                        avatar: true
                    })
                    .done(),
                as: "user"
            })
            .project({
                id: "$_id",
                _id: false,
                name: true,
                url: true,
                user: this.db.command.aggregate.arrayElemAt(["$user", 0]),
                create_at: true
            })
            .end())
            .data;
    }

    async add_online_tool(name, url, user_id) {
        let now_time = Date.now();
        let id = (await this.db.collection('online_tools').add({
            name,
            url,
            user_id,
            create_at: now_time
        })).id;

        console.info("tool_id:", id);

        return {
            id,
            create_at: now_time
        };
    }

    async delete_online_tool(tool_id) {
        await this.db
            .collection(tables.online_tools)
            .doc(tool_id)
            .remove()
    }
}
