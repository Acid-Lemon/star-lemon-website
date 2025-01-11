<script>
import {call_api} from "../utils/cloud";
import {use_user_info_store} from "@/src/stores/userInfo";
import {ElNotification} from "element-plus";
import axios from "axios";

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
        await this.get_avatar();
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
    },
    methods: {
        async get_avatar() {
            let avatar_name = this.user_info?.avatar.name;
            let type = this.user_info?.avatar.type;
            if (avatar_name) {
                if (type === "upload") {
                    let avatar_url_res = await call_api("user/profile/get_upload_avatar_temp_url", {
                        image_name: avatar_name,
                    });

                    if (!avatar_url_res.success) {
                        ElNotification({
                            title: 'Error',
                            message: avatar_url_res,
                            type: 'error',
                        });
                        console.log(avatar_url_res);
                        return;
                    } else {
                        try {
                            const response = await axios.get(avatar_url_res.data.temp_url, {
                                responseType: 'blob',
                                headers: {
                                    'Cache-Control': 'max-age=86400', // 缓存24小时
                                },
                            });
                            this.avatar_url = URL.createObjectURL(response.data);
                        } catch (error) {
                            console.error('获取头像时出错:', error);
                        }

                    }

                    this.avatar_url = avatar_url_res.data.temp_url
                } else {
                    this.avatar_url = "/static/avatar/" + avatar_name
                }
            }
        },
        toggle_assistant() {
            this.is_open = !this.is_open;
        },

        async send_message() {
            if (!this.user_input.trim()) return;

            this.message_list.push({'role': 'user', 'content': this.user_input});

            this.user_input = "";

            let res = await call_api("AI_assistant/get_answer", {
                message_list: this.message_list
            })

            this.message_list = res.data.message_list.filter(message => message.role !== 'system');


        },
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
                        <el-avatar :size=40 :src="message.role === 'user' ? this.avatar_url : null">
                            {{ message.role === 'user' ? "user" : "AI" }}
                        </el-avatar>
                        <div
                            :class="['ml-4 mb-4 p-2 rounded-lg w-[90%]',message.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800']">
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
            <el-button
                round
                @click="toggle_assistant"
            >
                AI 助手
            </el-button>
        </div>
    </div>
</template>
