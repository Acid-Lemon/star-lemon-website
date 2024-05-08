const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

module.exports = class DBService_SmsCode extends Service {
    async find_code(phone_number) {
        return await this.db.collection(tables.sms_code).where({phone_number}).get().data[0];
    }

    async store_code(code, phone_number) {
        await this.db.collection(tables.sms_code).add({
            phone_number,
            code,
            create_at: Date.now()
        });
    }
}
