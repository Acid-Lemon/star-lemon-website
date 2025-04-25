const {redis, redis_fields} = require("../utils/db/redis");

const db = uniCloud.database();
const { tables } = require("../service/db/tables");

const {
    id_name_format
} = require("../utils/db/result_format");

const errors = require("../types/api_error");

module.exports = () => {
    return async function (ctx, next) {
        let auth = ctx.auth;
        if (auth) {
            ctx.user = await find_user(auth.user_id);
            if (ctx.user === null || ctx.user === undefined) {
                ctx.throw(errors.codes.no_user)
            }
            console.info("user:", ctx.user);
        }

        await next();
    }
}

async function find_user(user_id) {
    let user_redis_key = redis_fields.user_info.key_prefix + user_id;
    let redis_val = await redis.get(user_redis_key);

    if (redis_val) {
        return JSON.parse(redis_val);
    }

    let db_val = await db.collection(tables.user).doc(user_id).get().then(({data}) => {
        if (!data.length) {
            return null;
        }

        return id_name_format(data[0]);
    });

    if (!db_val) {
        return null;
    }

    await redis.set(user_redis_key, JSON.stringify(db_val), "EX", redis_fields.user_info.ex);

    return db_val;
}
