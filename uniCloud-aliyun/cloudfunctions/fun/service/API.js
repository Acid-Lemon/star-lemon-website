const {
    Service
} = require("uni-cloud-router");

const config = require("uni-config-center")({pluginId: "fun"}).config();

module.exports = class Service_API extends Service {
    get_api_key() {
        return config["API_KEY"];
    }
};
