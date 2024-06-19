const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

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

    async create_user(user) {
        let record_id = (await this.db.collection(tables.user).add({
            ...user,
            create_at: Date.now()
        })).id;

        return {id: record_id};
    }
}

