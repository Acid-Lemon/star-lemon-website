const Redis = require("ioredis");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const redis = new Redis({
    port: config["REDIS_PORT"],
    host: config["REDIS_HOST"],
    password: config["REDIS_PASSWORD"],
    db: 0,
    connectTimeout: 3000
});

const fields = {
    user_info: {key_prefix: "user:info:", ex: 60 * 60},
    email_code: {key_prefix: "email_code:", ex: 60 * config["EMAIL_CODE_EXP_MINUTE"]},
    email_send_limit_hour: {key_prefix: "email-send-limit:hour:", ex: 60 * 60},
    email_send_limit_minute: {key_prefix: "email-send-limit:minute:", ex: 60},
    user_roles: {key_prefix: "user-roles:", ex: 60 * 60 * 24 * 7}
};

module.exports = {
    redis,
    redis_fields: fields
}
