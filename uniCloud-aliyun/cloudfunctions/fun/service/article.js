const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_Article extends Service {
    async create_article(title, content, type) {
        let {
            id,
            create_at
        } = await this.service.db.article.create_article(title, content, type,
            {num: 0, users: []}, {num: 0, users: []}, {num: 0, users: []},
            this.ctx.user.id, true);
        return {
            id,
            create_at,
            views: {num: 0, users: []},
            comments: {num: 0, users: []},
            likes: {num: 0, users: []},
            public_state: true
        }
    }

    async update_article(article_id, title, content, type) {
        let {
            update_at
        } = await this.service.db.article.update_article(article_id, title, content, type);
        return {
            article_id,
            update_at,
        }
    }

    async get_personal_and_public_articles(article_number, time_range = {}, skip_numbers = 0, type = "all") {
        return await this.service.db.article.get_personal_and_public_articles(article_number, time_range, skip_numbers, type)
    }

    async get_all_articles_admin(article_number, time_range = {}, skip_numbers = 0, type = "all") {
        return await this.service.db.article.get_all_articles_admin(article_number, time_range, skip_numbers, type)
    }

    async get_article(article_id) {
        if (this.ctx?.user?.id) {
            await this.service.db.article.add_view(article_id, this.ctx.user.id);
        }
        return await this.service.db.article.get_article(article_id, this.ctx?.user?.id);
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
