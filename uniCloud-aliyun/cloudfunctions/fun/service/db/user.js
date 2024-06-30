const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    codes
} = require("../../types/error");

const { id_name_format } = require("../../utils/db/result_format");

module.exports = class DBService_User extends Service {
    async find_user_by_id(id) {
        return id_name_format((await this.db.collection(tables.user).doc(id).get()).data[0]);
    }

    async find_user_by_name(name) {
        return id_name_format((await this.db.collection(tables.user).where({name}).get()).data[0]);
    }

    async find_user_by_phone_number(phone_number) {
        return id_name_format((await this.db.collection(tables.user).where({phone_number}).get()).data[0]);
    }

    async check_user_exist_by_name(name) {
        return Boolean((await this.db.collection(tables.user).where({
            name
        }).count()).total);
    }

    async create_user(user) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.user.check_user_exist_by_name(user.name)) {
                this.throw(codes.err_exist_username, "username exist");
            }

            let record_id = (await transaction.collection(tables.user).add({
                ...user,
                create_at: Date.now()
            })).id;

            await transaction.commit();

            return {id: record_id};
        } catch (err) {
            console.error(err);
            await transaction.rollback();

            if (err.customize) {
                throw err;
            } else {
                this.throw(codes.err_user_create, "user create error");
            }
        }
    }

    async update_user(id, info) {
        return await this.db.collection(tables.user).doc(id).update({
            ...info
        });
    }
}

