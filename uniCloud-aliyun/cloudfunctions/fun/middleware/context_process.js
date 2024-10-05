const {redis, redis_fields} = require("../utils/db/redis");

const db = uniCloud.database();
const { tables } = require("../service/db/tables");

const {
    id_name_format
} = require("../utils/db/result_format");

module.exports = () => {
    return async function (ctx, next) {
        let auth = ctx.auth;
        if (auth) {
            ctx.user = await find_user(auth.user_id);
            console.info("user:", ctx.user);
        }

        await next();
    }
}

async function find_user(user_id) {
    let user_redis_key = redis_fields.user_info.key_prefix + user_id;
    let redis_val = await redis.hgetall(user_redis_key);

    if (redis_val) {
        return redis_val;
    }

    let db_val = await db.collection(tables.user).doc(user_id).get().then(({data}) => {
        if (!data.length) {
            return null;
        }

        return id_name_format(data[0]);
    });

    await redis.hset(user_redis_key, db_val);
    await redis.expire(user_redis_key, redis_fields.user_info.ex);

    return db_val;
}
