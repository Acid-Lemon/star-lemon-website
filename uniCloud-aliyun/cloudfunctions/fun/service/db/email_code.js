const {
    Service
} = require("uni-cloud-router");

const { redis, redis_fields } = require("../../utils/db/redis");

const error = require("../../types/api_error");

const config = require("uni-config-center")({ pluginId: "fun" }).config();
const send_limit_config = config["EMAIL_SEND_LIMIT"];

module.exports = class DBService_EmailCode extends Service {
    async find_email_code(email) {
        let redis_key = redis_fields.email_code.key_prefix + email;
        return await redis.get(redis_key) ?? null;
    }

    async update_email_code(code, email) {
        let redis_key = redis_fields.email_code.key_prefix + email;
        await redis.set(redis_key, code, "EX", redis_fields.email_code.ex);
    }

    async delete_email_code(email) {
        let redis_key = redis_fields.email_code.key_prefix + email;
        await redis.del(redis_key);
    }

    async check_code_send_limit(email) {
        const limit_hour = send_limit_config["hour"], limit_minute = send_limit_config["minute"];
        if (limit_hour) {
            const limit_key = redis_fields.email_send_limit_hour.key_prefix + email, ex = redis_fields.email_send_limit_hour.ex;
            let hour_send_count = await redis.incr(limit_key);
            await redis.expire(limit_key, ex, "NX");
            if (hour_send_count > limit_hour) {
                this.throw(error.codes.rate_limit, {
                    renew_time: Date.now() + await redis.ttl(limit_key)
                });
            }
        }
        if (limit_minute) {
            const limit_key = redis_fields.email_send_limit_minute.key_prefix + email, ex = redis_fields.email_send_limit_minute.ex;
            let minute_send_count = await redis.incr(limit_key);
            await redis.expire(limit_key, ex, "NX");
            if (minute_send_count > limit_minute) {
                this.throw(error.codes.rate_limit, {
                    renew_time: Date.now() + await redis.ttl(limit_key)
                });
            }
        }
    }

    async update_code_with_limit(code, email) {
        await this.check_code_send_limit(email);
        await this.update_email_code(code, email);
    }
}
