const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

module.exports = class DBService_StatisticalData extends Service {
    async get_all_article_num() {
        return (await this.db.collection(tables.article).aggregate()
            .count('article_num')
            .end()).data[0].article_num
    }

    async get_all_message_num() {
        return (await this.db.collection(tables.message_board).aggregate()
            .count('message_num')
            .end()).data[0].message_num
    }
}
