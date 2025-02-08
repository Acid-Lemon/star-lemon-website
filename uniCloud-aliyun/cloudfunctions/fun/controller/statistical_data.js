const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

module.exports = class Controller_StatisticalData extends Controller {
    async get_num() {
        let res = await this.service.statistical_data.get_num();

        return {
            data: res
        }
    }
}
