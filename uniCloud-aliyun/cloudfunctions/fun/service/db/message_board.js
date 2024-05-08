const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

module.exports = class DBService_MessageBoard extends Service {
    async create_message(content, user_id, public_state) {
        return await this.db.collection(tables.message_board).add({
            content,
            user_id,
            public_state,
            create_at: Date.now()
        });
    }

    async change_public_state(id, new_state) {
        return await this.db.collection(tables.message_board).doc(id).update({
            public_state: new_state
        });
    }

    async get_messages(limit_num, from_time = 0) {
        return (await this.db.collection(tables.message_board).aggregate()
            .match({
                create_at: this.db.command.gt(from_time)
            })
            .limit(limit_num)
            .lookup({
                from: tables.user,
                let: {
                    user_id: "$user_id"
                },
                pipeline: this.db.command.aggregate.pipeline()
                    .match(this.db.command.expr(this.db.command.
                        eq(["$_id", "$$user_id"])
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
                content: true,
                user: true,
                create_at: true,
                public_state: true
            })
            .end())
            .data;
    }
}
