<script>
import {call_api} from "../utils/cloud";
import {get_avatar} from "@/src/utils/get_avatar";

export default {
    data() {
        return {
            is_open: false,
            user_input: '',
            message_list: [],
            avatar_url: '',
        };
    },
    async mounted() {
        this.avatar_url = await get_avatar();
    },
    methods: {

        toggle_assistant() {
            this.is_open = !this.is_open;
        },

        async get_answer() {
            if (!this.user_input.trim()) return;

            this.message_list.push({'role': 'user', 'content': this.user_input});
            this.user_input = "";

            // 流式响应，对message的处理
            this.message_list.push({'role': 'assistant', 'content': ''});

            const channel = new uniCloud.SSEChannel();
            channel.on('message', (message) => {
                this.message_list[this.message_list.length - 1].content += message;
            });
            await channel.open();

            await call_api("AI_assistant/get_answer", {
                channel,
                message_list: this.message_list.slice(0, -1)
            });
        }
    },
};
</script>

<template>
    <div class="fixed bottom-4 right-4 z-50">
        <div class="flex flex-col items-end">
            <div v-if="is_open" class="bg-white rounded-lg shadow-xl w-[500px] h-[400px] flex flex-col mb-4">
                <div class="w-full h-[350px] p-4 overflow-y-auto">
                    <div v-for="(message, index) in message_list" :key="index"
                         class="flex flex-row">
                        <el-avatar :size=40
                                   :src="message.role === 'user' ? this.avatar_url : '/static/ai_avatar/girl.png'">
                            {{ message.role === 'user' ? "user" : "AI" }}
                        </el-avatar>
                        <div
                            :class="['ml-4 mb-4 p-2 rounded-lg w-[90%] min-h-10',message.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800']">
                            {{ message.content }}
                        </div>
                    </div>
                </div>
                <div class="w-full h-[50px] border-t">
                    <div class="w-full h-[50px] flex flex-row justify-center items-center p-4">
                        <el-input
                            v-model="user_input"
                            placeholder="输入您的问题..."
                            style="margin-right: 20px"
                            @keyup.enter.native="get_answer"
                        >
                        </el-input>
                        <el-button
                            @click="get_answer"
                        >
                            发送
                        </el-button>
                    </div>
                </div>
            </div>
            <el-button
                round
                @click="toggle_assistant"
            >
                AI 助手
            </el-button>
        </div>
    </div>
</template>
