<script>
import {call_api} from "../../utils/cloud.js";
import {load_user} from "../../utils/user_info";

import {ElLoading, ElNotification} from "element-plus";

export default {
    data() {
        return {
            state: {
                is_login: true,// 登录和注册，登陆状态是true，注册状态是false
                mode: true,// 用户名登录和手机号登录，用户名登录是true，手机号登录是false
            },
            username: "",
            password: "",
            confirm_password: "",
            phone_number: "",
            code: "",
            code_state: false,
            countdown: 60,
            username_tip: "",
            password_tip: "",
            confirm_password_tip: "",
            phone_number_tip: "",
            code_tip: "",

        };
    },
    methods: {
        register_mode() {
            this.state.is_login = false;
            this.phone_number_tip = "如若没有可不填";
        },
        username_mode() {
            this.state.is_login = true;
            this.state.mode = true;
        },
        phone_number_mode() {
            this.state.is_login = true;
            this.state.mode = false;
            this.phone_number_tip = "";

        },
        check() {
            if (this.username.length < 1 || this.username.length > 15) {
                this.username_tip = "用户名不符合要求";
                this.username = "";
                return false;
            }
            if (this.password.length < 5 || this.password.length > 25) {
                this.password_tip = "密码不符合要求";
                this.password = "";
                this.confirm_password = "";
                return false;
            }
            if (this.password !== this.confirm_password) {
                this.confirm_password_tip = "前后密码不一致";
                this.confirm_password = "";
                return false;
            }
            return true;
        },
        async send_code() {
            this.code_state = true;

            if (!(/^1[3456789]\d{9}$/.test(this.phone_number))) {
                ElNotification({
                    title: 'Warning',
                    type: "warning",
                    message: "手机号格式错误",
                });

                this.code_state = false;
                return;
            }

            let res = await call_api("user/login/send_code", {
                phone_number: this.phone_number,
                mode: this.state.is_login === true ? "登录" : "注册"
            });

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "发送成功",
                });

                this.code_state = true;
                this.timer = setInterval(() => {
                    this.countdown--;

                    if (this.countdown === 0) {
                        // 结束倒计时，恢复按钮状态
                        clearInterval(this.timer);
                        this.code_state = false;
                        this.countdown = 60; // 重置倒计时
                    }
                }, 1000);
            } else {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: "发送失败：" + res.code,
                });
            }
            this.code_state = false;
        },
        async login() {
            if (this.state.is_login === false) {
                if (!this.check()) {
                    return;
                }
            }

            if (!this.state.mode && !this.code) {
                ElNotification({
                    title: 'Warning',
                    type: "warning",
                    message: "未填写验证码",
                });

                return;
            }

            let loading = ElLoading.service();
            let res;
            if (this.state.is_login === true && this.state.mode === true) {
                res = await call_api(`user/login/${this.state.is_login === true ? "login" : "register"}_by_user`, {
                    username: this.username,
                    password: this.password
                });
            } else {
                res = await call_api(`user/login/${this.state.is_login === true ? "login" : "register"}_by_sms`, {
                    username: this.username,
                    password: this.password,
                    phone_number: this.phone_number,
                    code: this.code
                });
            }

            loading.close();


            if (!res.success) {
                // 显示错误
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: res,
                });

                console.log(res);

                return;
            }

            await load_user();

            if (this.state.is_login && res.success) {
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "登录成功",
                })

                // 登录成功后跳转回原页面
                this.$router.back();
            }


            if (!this.state.is_login && res.success) {
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "注册成功",
                })

                this.state.is_login = true
            }
        }
    }
}
</script>

<template>
    <div
        class="bg-[url('/static/background/22.jpg')] h-full w-full bg-cover flex flex-row justify-between items-center p-[5vh]">
        <div class="md:block hidden w-[100%]">
            <div class="flex flex-col items-center">
                <span class="font-['RGBZ'] text-[5vw] text-[#FFFFFF]">“海阔凭鱼跃，</span>
                <span class="font-['RGBZ'] text-[5vw] text-[#FFFFFF] pl-[20%]">天高任鸟飞。”</span>
            </div>
        </div>
        <div
            class="bg-white bg-opacity-80 backdrop-blur-md md:w-[360px] w-[95vw] h-[85vh] shadow-sm rounded-lg p-[3vh] mt-[12vh] mb-[3vh]">
            <div class="w-full h-full">
                <span class="text-[4vh] font-['SYST']">{{ state.is_login === true ? "登录" : "注册" }}</span>
                <div class="my-[2vh] flex flex-col justify-between align-top w-full">
                    <!--    注册或用户名密码登录        -->
                    <div v-if="!state.is_login || (state.mode && state.is_login)" class="flex flex-col">
                        <span class="my-[0.5vh] text-[2vh] font-['FZSX']">用户名：</span>
                        <el-input v-model="username" :placeholder="username_tip"
                                  style="width: 100%;height:4vh;"/>
                    </div>
                    <!--    手机号登录注册或用户名注册        -->
                    <div v-if="!state.mode || !state.is_login" class="flex flex-col">
                        <span class="my-[0.5vh] text-[2vh] font-['FZSX']">手机号码：</span>
                        <el-input v-model="phone_number" :placeholder="phone_number_tip"
                                  style="width: 100%;height:4vh"/>
                    </div>
                    <!--    手机号登录注册或用户名注册        -->
                    <div v-if="!state.mode || !state.is_login" class="flex flex-col">
                        <span class="my-[0.5vh] text-[2vh] font-['FZSX']">验证码：</span>
                        <div class="flex flex-row justify-between">
                            <el-input v-model="code" :placeholder="code_tip" style="width: 50%;height:4vh"/>
                            <el-button :disabled="code_state" round style="width: 40%;height: 4vh" @click="send_code">
                                {{ countdown < 60 ? `${countdown}s` : '获取验证码' }}
                            </el-button>
                        </div>
                    </div>
                    <!--     注册或用户名密码登录       -->
                    <div v-if="!state.is_login || (state.mode && state.is_login)" class="flex flex-col">
                        <span class="my-1 text-[2vh] font-['FZSX']">密码：</span>
                        <el-input v-model="password" :placeholder="password_tip" style="width: 100%;height:4vh"
                                  type="password"/>
                    </div>
                    <!--      注册      -->
                    <div v-if="!state.is_login" class="flex flex-col">
                        <span class="my-1 text-[2vh] font-['FZSX']">确认密码：</span>
                        <el-input v-model="confirm_password" :placeholder="confirm_password_tip"
                                  style="width: 100%;height:4vh"
                                  type="password"/>
                    </div>
                </div>
                <el-button round style="width: 100%;height: 4vh" type="primary" @click="login">
                    {{ state.is_login === true ? "登录" : "注册" }}
                </el-button>
                <!--    用户名密码登录      -->
                <div v-if="state.is_login && state.mode" class="flex flex-row justify-between">
                    <div class="my-2" @click="register_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">注册</span>
                    </div>
                    <div class="my-2" @click="phone_number_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">手机号登录</span>
                    </div>
                </div>
                <div v-if="!state.is_login" class="flex flex-row justify-between">
                    <div class="my-2" @click="username_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">用户名登录</span>
                    </div>
                    <div class="my-2" @click="phone_number_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">手机号登录</span>
                    </div>
                </div>
                <div v-if="state.is_login && !state.mode" class="flex flex-row justify-between">
                    <div class="my-2" @click="register_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">注册</span>
                    </div>
                    <div class="my-2" @click="username_mode">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">用户名登录</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
