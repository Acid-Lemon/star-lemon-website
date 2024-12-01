const {
    Controller
} = require("uni-cloud-router");

module.exports = class Controller_API extends Controller {
    async get_api_key() {
        let api_key = await this.service.API.get_api_key();
        return {
            data: {
                api_key
            }
        };
    }
};
