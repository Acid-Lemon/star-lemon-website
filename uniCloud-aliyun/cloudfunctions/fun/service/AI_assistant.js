const {
    Service
} = require("uni-cloud-router");

const config = require("uni-config-center")({pluginId: "fun"}).config();

module.exports = class Service_AI_assistant extends Service {

    async get_answer(message_list) {
        let api_key = config['API_KEY'];

        const chat_res = await uniCloud.httpclient.request("https://api.coze.cn/v3/chat", {
            method: 'POST',
            data: {
                "bot_id": "7436266817444282387",
                "user_id": this.ctx.user.id,
                "additional_messages": message_list,
                "stream": false,
                "auto_save_history": true
            },
            headers: {
                "Authorization": `Bearer ${api_key}`,
                "Content-Type": "application/json",
            },
            dataType: 'json'
        });

        let conversation_id = chat_res.data.data.conversation_id;
        let chat_id = chat_res.data.data.id;

        const MAX_RETRIES = 30; // 设置最大尝试次数
        let retries = 0;

        while (retries < MAX_RETRIES) {
            const retrieve_res = await uniCloud.httpclient.request("https://api.coze.cn/v3/chat/retrieve", {
                method: 'GET',
                data: {
                    conversation_id: conversation_id,
                    chat_id: chat_id,
                },
                headers: {
                    "Authorization": `Bearer ${api_key}`,
                    "Content-Type": "application/json",
                },
                dataType: 'json'
            });

            const status = retrieve_res.data.data.status;

            if (status === 'completed') break; // 成功完成，退出循环
            await new Promise(resolve => setTimeout(resolve, 2000)); // 延迟 2 秒
            retries++;
        }

        const message_res = await uniCloud.httpclient.request("https://api.coze.cn/v3/chat/message/list", {
            method: 'GET',
            data: {
                conversation_id: conversation_id,
                chat_id: chat_id,
            },
            headers: {
                "Authorization": `Bearer ${api_key}`,
                "Content-Type": "application/json",
            },
            dataType: 'json'
        });

        const answer = message_res.data.data[0].content;

        return {
            message_list: message_list.concat({'role': 'assistant', 'content': answer, 'content_type': 'text'})
        }
    }
};
