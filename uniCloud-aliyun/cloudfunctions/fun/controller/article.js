const {
    Controller
} = require("uni-cloud-router");

const {
    validate,
    validate_time_range
} = require("../utils/args_check");

const {
    codes
} = require("../types/api_error");

module.exports = class Controller_Article extends Controller {
    async create_article() {
        let {
            title,
            content,
            type
        } = validate(this.ctx.event.args, {
            title: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            },
            content: {
                type: "string",
                length: {
                    max: 5000,
                    min: 1
                }
            },
            type: {
                type: "string",
                not_null: true,
                customize: (args, name) => {
                    return args[name] === "note" || args[name] === "diary" || args[name] === "sentence" || args[name] === "other";
                }
            }
        });

        let res = await this.service.article.create_article(title, content, type)
        return {
            data: res
        };
    }

    async get_personal_and_public_articles() {
        let {
            time_range = {},
            article_number,
            skip_number = 0,
            type
        } = validate(this.ctx.event.args, {
            time_range: {
                undefined_able: true,
                null_able: true,
                type: "object"
            },

            article_number: {
                type: "number",
                math: {
                    max: 20,
                    min: 1
                }
            },

            skip_number: {
                undefined_able: true,
                null_able: true,
                type: "number",

                math: {
                    min: 0,
                    max: 200
                }
            },

            type: {
                type: "string",
                undefined_able: true,
                not_null: true,
                customize: (args, name) => {
                    return args[name] === "all" || args[name] === "note" || args[name] === "diary" || args[name] === "sentence" || args[name] === "other";
                }
            }
        });

        validate_time_range(time_range);

        let articles = await this.service.article.get_personal_and_public_articles(article_number, time_range, skip_number, type);
        return {
            data: {
                articles
            }
        };
    }

    async get_article() {
        let {
            article_id
        } = validate(this.ctx.event.args, {
            article_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        })

        let res = await this.service.article.get_article(article_id);

        return {
            data: res
        }
    }

    async change_article_public_state() {
        let {
            article_id,
            public_state
        } = validate(this.ctx.event.args, {
            article_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            },
            public_state: {
                type: "boolean"
            }
        });

        if (!await this.service.article.check_permissions("change_article_public_state")) {
            this.throw(codes.err_permission_denied, "No permission to change public state");
        }

        let res = await this.service.article.change_article_public_state(article_id, public_state);
        return {
            data: res
        }
    }

    async delete_article() {
        let {
            article_id
        } = validate(this.ctx.event.args, {
            article_id: {
                type: "string",
                length: {
                    max: 100,
                    min: 1
                }
            }
        });

        if (await this.service.article.check_permissions("delete_article", article_id)) {
            let res = await this.service.article.delete_article(article_id);
            return {
                data: res
            }
        } else {
            this.throw(codes.err_permission_denied, "No permission to delete article");
        }
    }
}
