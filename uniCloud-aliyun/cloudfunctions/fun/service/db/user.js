const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

module.exports = class DBService_User extends Service {
    async find_user_by_id(id) {
        return (await this.db.collection(tables.user).doc(id).get()).data[0];
    }

    async find_user_by_username(username) {
        return (await this.db.collection(tables.user).where({username}).get()).data[0];
    }

    async find_user_by_phone_number(phone_number) {
        return (await this.db.collection(tables.user).where({phone_number}).get()).data[0];
    }

    async create_user(user) {
        return await this.db.collection(tables.user).add({
            ...user,
            create_at: Date.now()
        });
    }
}
