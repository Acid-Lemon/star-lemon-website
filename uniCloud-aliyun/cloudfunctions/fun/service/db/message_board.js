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
            create_at: now_time,
            review: false
        })).id;
        console.info("message_id:", id);

        return {
            id,
            create_at: now_time
        };
    }

    async get_personal_and_public_messages(limit_num, time_range = {}, skip_number = 0) {
        let {
            create_at_match_obj,
            time_sort_direction
        } = convert_time_range(time_range);

        return (await this.db.collection(tables.message_board).aggregate()
            .match(this.db.command.and([
                {...create_at_match_obj},
                this.db.command.or([
                    {public_state: true},
                    {user_id: this.ctx.auth?.user_id ?? ""}
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
                    .match(this.db.command.expr(this.db.command.eq(["$_id", "$$user_id"])
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

    async get_all_messages_admin(limit_num, time_range = {}, skip_number = 0, type) {
        let {
            create_at_match_obj,
            time_sort_direction
        } = convert_time_range(time_range);

        if (type === "all") {
            return (await this.db.collection(tables.message_board).aggregate()
                .match(
                    {...create_at_match_obj},
                )
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
                        .match(this.db.command.expr(this.db.command.eq(["$_id", "$$user_id"])
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
        } else if (type === "reviewed") {
            return (await this.db.collection(tables.message_board).aggregate()
                .match(this.db.command.and([
                    {...create_at_match_obj},
                    {review: true}
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
                        .match(this.db.command.expr(this.db.command.eq(["$_id", "$$user_id"])
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
        } else {
            return (await this.db.collection(tables.message_board).aggregate()
                .match(this.db.command.and([
                    {...create_at_match_obj},
                    {review: false}
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
                        .match(this.db.command.expr(this.db.command.eq(["$_id", "$$user_id"])
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

    async change_message_public_state(message_id, public_state) {
        await this.db
            .collection(tables.message_board)
            .doc(message_id)
            .update({
                "public_state": public_state,
                "review": true
            })

    }

    async find_user_id_by_message_id(message_id) {
        return await this.db
            .collection(tables.message_board)
            .doc(message_id)
            .field({"_id": false, "user_id": true})
            .get()
            .then(res => res.data[0].user_id)
    }

    async delete_message(message_id) {
        await this.db
            .collection(tables.message_board)
            .doc(message_id)
            .remove()
    }
}
