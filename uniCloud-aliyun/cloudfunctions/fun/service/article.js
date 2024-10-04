const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_Article extends Service {
    async create_article(title, content, type) {
        let {
            id,
            create_at
        } = await this.service.db.article.create_article(title, content, type, 0, 0, 0, this.ctx.user.id, true);
        return {
            id,
            create_at,
            views: 0,
            comments: 0,
            likes: 0,
            public_state: true
        }
    }

    async get_personal_and_public_articles(article_number, time_range = {}, skip_numbers = 0, type = "all") {
        time_range = time_range ?? {};
        return await this.service.db.article.get_personal_and_public_articles(article_number, time_range, skip_numbers, type)
    }

    async get_article(article_id) {
        return await this.service.db.article.get_article(article_id);
    }

    async change_article_public_state(article_id, public_state) {
        return await this.service.db.article.change_article_public_state(article_id, public_state);
    }

    async check_permissions(type, article_id) {
        if (type === "delete_article") {
            return this.ctx.user.role === "admin"
                || await this.service.db.article.find_user_id_by_article_id(article_id) === this.ctx.user.id
        } else if (type === "change_article_public_state") {
            return this.ctx.user.role === "admin"
        }

    }

    async delete_article(article_id) {
        return await this.service.db.article.delete_article(article_id);
    }
}
