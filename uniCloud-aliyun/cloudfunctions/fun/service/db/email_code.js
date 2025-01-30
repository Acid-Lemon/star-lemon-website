const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const error = require("../../types/api_error");

const { id_name_format } = require("../../utils/db/result_format");
const obj_utils = require("../../utils/common/object");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

module.exports = class DBService_EmailCode extends Service {
    async find_code(email) {
        return await this.db.collection(tables.email_code).where({email}).get().then(({data}) => {
            if (!data.length) {
                return null;
            }

            return id_name_format(data[0]);
        });
    }

    async delete_code_by_id(id) {
        await this.db.collection(tables.email_code).doc(id).remove();
    }

    async add_code(code, email) {
        return await this.db.collection(tables.email_code).add({
            email,
            code,
            send_at: [Date.now()]
        });
    }

    async update_code_with_limit(code, email) {
        let exist_code_record = await this.find_code(email);
        if (!exist_code_record) {
            return await this.add_code(code, email);
        }

        let transaction = await this.db.startTransaction();
        try {
            let code_record = await transaction.collection(tables.email_code).doc(exist_code_record.id).get().then(({data}) => id_name_format(data));
            if (!code_record) {
                return await this.add_code(code, email);
            }

            const send_limit_config = config["EMAIL_SEND_LIMIT"];
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
                        this.throw(error.codes.rate_limit, {
                            renew_time: now_time + (3600 * 1000 - (now_time - send_time_list[send_time_list.length - 1]))
                        });
                    }
                }

                if (limit_minute) {
                    let valid_num = send_time_list.filter((time) => {
                        return time >= now_time - 60 * 1000;
                    }).length;
                    if (valid_num + 1 > limit_minute) {
                        this.throw(error.codes.rate_limit, {
                            renew_time: now_time + (60 * 1000 - (now_time - send_time_list[send_time_list.length - 1]))
                        });
                    }
                }

                send_time_list.push(now_time);
                await transaction.collection(tables.email_code).doc(code_record.id).update({
                    code,
                    send_at: send_time_list
                });

                await transaction.commit();
            }
        } catch (err) {
            await transaction.rollback();

            console.error("add_email_code_with_limit error:", err);
            this.throw(error.codes.rate_limit, err.customize ? { renew_time: err.info.renew_time } : {});
        }
    }

    async delete_code_last_send_record(id) {
        await this.db.collection(tables.email_code).doc(id).update({
            send_at: this.db.command.pop()
        });
    }
}
