const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

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

    async get_personal_and_public_messages(limit_num, time_range={}) {
        let {
            from_time,
            to_time
        } = time_range;

        let time_sort_direction = 1;
        if (from_time > to_time) {
            time_sort_direction = -1;
            [from_time, to_time] = [to_time, from_time];
        }

        let create_at_match_obj;
        if (from_time) {
            if (to_time) {
                create_at_match_obj = {
                    create_at: this.db.command.and([
                        this.db.command.gte(from_time),
                        this.db.command.lte(to_time)
                    ])
                };
            } else {
                create_at_match_obj = {
                    create_at: this.db.command.gte(from_time)
                };
            }
        } else if (to_time) {
            create_at_match_obj = {
                create_at: this.db.command.lte(to_time)
            };
        } else {
            create_at_match_obj = {
                create_at: true
            };
        }

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
