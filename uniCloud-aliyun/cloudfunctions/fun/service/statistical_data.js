const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_StatisticalData extends Service {
    async get_num() {
        return {
            article_num: await this.service.db.statistical_data.get_all_article_num(),
            message_num: await this.service.db.statistical_data.get_all_message_num()
        }
    }
}
