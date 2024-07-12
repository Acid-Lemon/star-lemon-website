const {kv, fields : kv_fields} = require("../utils/db/redis");
const db = uniCloud.database();
const { tables } = require("../service/db/tables");

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
    let user_redis_key = kv_fields.user_info.key_prefix + user_id;
    let redis_val = await kv.hgetall(user_redis_key);

    if (redis_val) {
        return redis_val;
    }

    let db_val = (await db.collection(tables.user).doc(user_id).get()).data[0];

    await kv.hset(user_redis_key, db_val);

    return db_val;
}
