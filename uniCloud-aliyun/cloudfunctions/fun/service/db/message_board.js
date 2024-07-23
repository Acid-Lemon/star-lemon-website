const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    convert_time_range
} = require("../../utils/db/compose_select_command");

module.exports = class DBService_MessageBoard extends Service {
    async create_message(content, user_id, public_state) {
        let now_time = Date.now();
        let id = (await this.db.collection(tables.message_board).add({
            content,
            user_id,
            public_state,
            create_at: now_time
        })).id;
        console.info("message_id:", id);

        return {
            id,
            create_at: now_time
        };
    }

    async change_public_state(id, new_state) {
        return await this.db.collection(tables.message_board).doc(id).update({
            public_state: new_state
        });
    }

    async get_personal_and_public_messages(limit_num, time_range={}, skip_number=0) {
        let {
            create_at_match_obj,
            time_sort_direction
        } = convert_time_range(time_range);

        return (await this.db.collection(tables.message_board).aggregate()
            .match(this.db.command.and([
                { ...create_at_match_obj },
                this.db.command.or([
                    { public_state: true },
                    { user_id: this.ctx.auth?.user_id ?? ""}
                ])
            ]))
            .sort({
                create_at: time_sort_direction
            })
            .skip(skip_number)
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
                user: this.db.command.aggregate.arrayElemAt(["$user", 0]),
                create_at: true,
                public_state: true
            })
            .end())
            .data;
    }
}
