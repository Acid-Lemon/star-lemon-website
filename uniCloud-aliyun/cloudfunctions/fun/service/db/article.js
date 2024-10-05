const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    convert_time_range
} = require("../../utils/db/compose_select_command");

module.exports = class DBService_Article extends Service {
    async create_article(title, content, type, views, comments, likes, user_id, public_state) {
        let now_time = Date.now();
        let id = (await this.db.collection(tables.article).add({
            title,
            content,
            type,
            views,
            comments,
            likes,
            user_id,
            public_state,
            create_at: now_time
        })).id;
        console.info("article_id:", id);

        return {
            id,
            create_at: now_time
        };
    }

    async get_personal_and_public_articles(limit_num, time_range = {}, skip_number = 0, type = "all") {
        let {
            create_at_match_obj,
            time_sort_direction
        } = convert_time_range(time_range);

        let type_match_obj = {type: type};
        if (type === "all") {
            type_match_obj = {}
        }

        return (await this.db.collection(tables.article).aggregate()
            .match(this.db.command.and([
                {...create_at_match_obj},
                {...type_match_obj},
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
                title: true,
                content: true,
                type: true,
                views: true,
                comments: true,
                likes: true,
                user: this.db.command.aggregate.arrayElemAt(["$user", 0]),
                create_at: true,
                public_state: true
            })
            .end())
            .data;
    }

    async get_article(article_id) {
        return (await this.db.collection(tables.article).aggregate()
            .match(this.db.command.and([
                {_id: article_id},
                this.db.command.or([
                    {public_state: true},
                    {user_id: this.ctx.auth?.user_id ?? ""}
                ])
            ]))
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
                title: true,
                content: true,
                type: true,
                views: true,
                comments: true,
                likes: true,
                user: this.db.command.aggregate.arrayElemAt(["$user", 0]),
                create_at: true,
                public_state: true
            })
            .end())
            .data[0];
    }

    async find_user_id_by_article_id(article_id) {
        return await this.db
            .collection(tables.article)
            .doc(article_id)
            .field({"_id": false, "user_id": true})
            .get()
            .then(res => res.data[0].user_id)
    }

    async delete_article(article_id) {
        await this.db
            .collection(tables.article)
            .doc(article_id)
            .remove()
    }
}