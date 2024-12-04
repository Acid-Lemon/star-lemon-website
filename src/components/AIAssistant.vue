<script>
import {call_api} from "../utils/cloud";

export default {
    data() {
        return {
            is_open: false,
            user_input: '',
            message_list: [],
        };
    },
    async mounted() {
    },
    computed: {},
    methods: {
        toggle_assistant() {
            this.is_open = !this.is_open;
        },

        async send_message() {
            if (!this.user_input.trim()) return;

            this.message_list.push({'role': 'user', 'content': this.user_input, 'content_type': 'text'});

            this.user_input = "";

            let res = await call_api("AI_assistant/get_answer", {
                message_list: this.message_list
            })

            this.message_list = res.data.message_list;


        },
    },
};
</script>

<template>
    <div class="fixed bottom-4 right-4 z-50">
        <el-button
            @click="toggle_assistant">
            AI 助手
        </el-button>
        <div v-if="is_open" class="bg-white rounded-lg shadow-xl w-80 h-96 mt-4 flex flex-col">
            <div class="flex-1 p-4 overflow-y-auto">
                <div v-for="(message, index) in message_list" :key="index"
                     :class="['mb-4 p-2 rounded-lg',message.type === 'user' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-100 text-gray-800']">
                    {{ message.content }}
                </div>
            </div>
            <div class="border-t p-4">
                <div class="flex">
                    <el-input
                        v-model="user_input"
                        placeholder="输入您的问题..."
                        @keyup.enter.native="send_message"
                    >
                    </el-input>
                    <el-button
                        @click="send_message"
                    >
                        发送
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>
