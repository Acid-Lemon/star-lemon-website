const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const { id_name_format } = require("../../utils/db/result_format");

module.exports = class DBService_SmsCode extends Service {
    async find_code(phone_number) {
        return id_name_format((await this.db.collection(tables.sms_code).where({phone_number}).get()).data[0]) || null;
    }

    async delete_code(id) {
        await this.db.collection(tables.sms_code).doc(id).remove();
    }

    async store_code(code, phone_number) {
        await this.db.collection(tables.sms_code).add({
            phone_number,
            code,
            create_at: Date.now()
        });
    }
}
