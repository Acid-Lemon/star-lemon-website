const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    redis,
    redis_fields
} = require("../../utils/db/redis");

const {
    codes
} = require("../../types/api_error");

const { id_name_format } = require("../../utils/db/result_format");

module.exports = class DBService_User extends Service {
    async find_user_by_id(id) {
        let redis_val = await redis.hgetall(redis_fields.user_info.key_prefix + id);
        if (redis_val) {
            return redis_val;
        }

        let db_val = id_name_format((await this.db.collection(tables.user).doc(id).get()).data[0]);
        if (db_val) {
            let redis_key = redis_fields.user_info.key_prefix + id;
            await redis.hset(redis_key, db_val);
            await redis.expire(redis_key, redis_fields.user_info.ex);
        }

        return db_val;
    }

    async find_user_by_name(name) {
        return id_name_format((await this.db.collection(tables.user).where({name}).get()).data[0]);
    }

    async find_user_by_email(email) {
        return id_name_format((await this.db.collection(tables.user).where({email}).get()).data[0]);
    }

    async find_user_by_qq_openid(qq_openid) {
        return id_name_format((await this.db.collection(tables.user).where({qq_openid}).get()).data[0]);
    }

    async check_user_exist_by_name(name) {
        return Boolean((await this.db.collection(tables.user).where({
            name
        }).count()).total);
    }

    async create_user(user) {
        if (await this.service.db.user.check_user_exist_by_name(user.name)) {
            this.throw(codes.err_exist_username, "username exist");
        }

        try {
            let record_id = (await this.db.collection(tables.user).add({
                ...user,
                create_at: Date.now()
            })).id;

            return {id: record_id};
        } catch (err) {
            console.error(err);

            this.throw(codes.err_user_create, "user create error");
        }
    }

    async update_user(id, info) {
        await redis.del(redis_fields.user_info.key_prefix + id);
        return await this.db.collection(tables.user).doc(id).update({
            ...info
        });
    }
}

