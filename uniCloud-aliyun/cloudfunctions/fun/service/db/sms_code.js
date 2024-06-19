const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const error = require("../../types/error");

const { id_name_format } = require("../../utils/db/result_format");
const obj_utils = require("../../utils/object");

const config = require('uni-config-center')({ pluginId: "fun" }).config();

module.exports = class DBService_SmsCode extends Service {
    async find_code(phone_number) {
        return id_name_format((await this.db.collection(tables.sms_code).where({phone_number}).get()).data[0]) || null;
    }

    async delete_code_by_id(id) {
        await this.db.collection(tables.sms_code).doc(id).remove();
    }

    async add_code(code, phone_number) {
        return await this.db.collection(tables.sms_code).add({
            phone_number,
            code,
            send_at: [Date.now()]
        });
    }

    async update_code_with_limit(code, phone_number) {
        let transaction = await this.db.startTransaction();
        try {
            let code_record = await this.find_code(phone_number);
            if (!code_record) {
                return await this.add_code(code, phone_number);
            }

            const send_limit_config = config["UNICLOUD_SMS_SEND_LIMIT"];
            if (!obj_utils.is_empty(send_limit_config ?? {})) {
                let now_time = Date.now();
                let limit_hour = send_limit_config["hour"], limit_minute = send_limit_config["minute"];

                let send_time_list = code_record.send_at;
                let valid_send_time_start = limit_hour ?
                    now_time - 3600 * 1000 :
                    now_time - 60 * 1000;
                send_time_list = send_time_list.filter((time) => {
                    return time >= valid_send_time_start;
                });

                if (limit_hour) {
                    let valid_num = send_time_list.filter((time) => {
                        return time >= now_time - 3600 * 1000;
                    }).length;
                    if (valid_num + 1 > limit_hour) {
                        this.throw(error.codes.sms_code_send_limit, {
                            renew_time: now_time + (3600 * 1000 - (now_time - send_time_list[send_time_list.length - 1]))
                        });
                    }
                }

                if (limit_minute) {
                    let valid_num = send_time_list.filter((time) => {
                        return time >= now_time - 60 * 1000;
                    }).length;
                    if (valid_num + 1 > limit_minute) {
                        this.throw(error.codes.sms_code_send_limit, {
                            renew_time: now_time + (60 * 1000 - (now_time - send_time_list[send_time_list.length - 1]))
                        });
                    }
                }

                send_time_list.push(now_time);
                await transaction.collection(tables.sms_code).doc(code_record.id).update({
                    code,
                    send_at: send_time_list
                });

                await transaction.commit();
            }
        } catch (err) {
            await transaction.rollback();

            console.log("add_code_with_limit error:", err);
            this.throw(error.codes.sms_code_send_limit, err.customize ? { renew_time: err.info.renew_time } : {});
        }
    }

    async delete_code_last_send_record(id) {
        await this.db.collection(tables.sms_code).doc(id).update({
            send_at: this.db.command.pop()
        });
    }
}
