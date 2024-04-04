const $OpenApi = require("@alicloud/openapi-client");
const $Util = require("@alicloud/tea-util");
const $Dysmsapi20170525 = require("@alicloud/dysmsapi20170525"), Dysmsapi20170525 = $Dysmsapi20170525.default;

class AliClient {
    static createDysmsapiClient(accessKeyId, accessKeySecret) {
        let config = new $OpenApi.Config({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
        });

        // Endpoint https://api.aliyun.com/product/Dysmsapi
        config.endpoint = `dysmsapi.aliyuncs.com`;
        return new Dysmsapi20170525(config);
    }

    static async send_sms_code(client, args) {
        if (!client instanceof Dysmsapi20170525) {
            throw new TypeError("client is not Dysmsapi20170525 client. use AliClient.createClient to create one");
        }

        let {
            phone_number,
            sign_name,
            template_code,
            template_param
        } = args;

        if (/^1[3456789]\d{9}$/.test(phone_number) === false) {
            throw {
                code: "err_phone_number",
                message: "invalid phone number"
            };
        }

        let request = new $Dysmsapi20170525.SendSmsRequest({
            phoneNumbers: phone_number,
            signName: sign_name,
            templateCode: template_code,
            templateParam: template_param
        });
        let runtime = new $Util.RuntimeOptions({});
        try {
            let response = await client.sendSmsWithOptions(request, runtime);
            console.log(response);
            if (response.body.code !== "OK") {
                throw new Error(response.body.message)
            }
            return {
                success: true,
                code: response.body.code,
                message: response.body.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = {
    AliClient
};
