<script>
import axios from 'axios';
import {use_user_info_store} from "../stores/userInfo";

export default {
    data() {
        return {
            isOpen: false,
            userInput: '',
            messages: [],
            apiKey: '',
            conversation_id: null,
            chat_id: null,
            status: null,
            intervalId: null
        };
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
    },
    methods: {
        toggleAssistant() {
            this.isOpen = !this.isOpen;
        },
        async get_chat() {
            console.log("发起对话");

            const chat_res = await axios.post("https://api.coze.cn/v3/chat", {
                "bot_id": "7436266817444282387",
                "user_id": this.user_info.id,
                "additional_messages": this.messages,
                "stream": false,
                "auto_save_history": true
            }, {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("发起对话完成");
            console.log(chat_res);

            this.conversation_id = chat_res.data.data.conversation_id;
            this.chat_id = chat_res.data.data.id;
        },
        async get_status() {
            console.log("查询状态");
            const retrieve_res = await axios.get("https://api.coze.cn/v3/chat/retrieve", {
                params: {
                    conversation_id: this.conversation_id,
                    chat_id: this.chat_id,
                },
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("查询状态完成");
            console.log(retrieve_res);

            this.status = retrieve_res.data.data.status;
        },
        async get_messages() {
            console.log("获取消息");
            clearInterval(this.intervalId);
            this.intervalId = null;

            const messages_res = await axios.get("https://api.coze.cn/v3/chat/message/list", {
                params: {
                    conversation_id: this.conversation_id,
                    chat_id: this.chat_id,
                },
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("获取消息完成");
            console.log(messages_res);

            const aiReply = messages_res.data.data[0].content;
            this.messages = this.messages.concat({'type': 'assistant', 'content': aiReply, 'content_type': 'text'});
        },
        async sendMessage() {
            if (!this.userInput.trim()) return;

            this.conversation_id = null;
            this.chat_id = null;
            this.status = null;

            this.messages.push({'role': 'user', 'content': this.userInput, 'content_type': 'text'});

            await this.get_chat();

            this.intervalId = setInterval(async () => {
                await this.get_status();

                if (this.status === 'completed') {
                    await this.get_messages();
                }
            }, 2000)

            this.userInput = '';
        },
    },
};
</script>

<template>
    <div class="fixed bottom-4 right-4 z-50">
        <el-button
            @click="toggleAssistant">
            AI 助手
        </el-button>
        <div v-if="isOpen" class="bg-white rounded-lg shadow-xl w-80 h-96 mt-4 flex flex-col">
            <div class="flex-1 p-4 overflow-y-auto">
                <div v-for="(message, index) in messages" :key="index"
                     :class="['mb-4 p-2 rounded-lg',message.type === 'user' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-100 text-gray-800']">
                    {{ message.content }}
                </div>
            </div>
            <div class="border-t p-4">
                <div class="flex">
                    <el-input
                        v-model="userInput"
                        placeholder="输入您的问题..."
                        @keyup.enter.native="sendMessage"
                    >
                    </el-input>
                    <el-button
                        @click="sendMessage"
                    >
                        发送
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>
