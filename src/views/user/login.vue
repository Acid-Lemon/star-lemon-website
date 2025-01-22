<script>
import {call_api} from "../../utils/cloud.js";
import {load_user} from "../../utils/user_info";

import {ElLoading, ElNotification} from "element-plus";

export default {
    data() {
        return {
            state: {
                is_login: true,
                is_email: false,
            },
            form: {
                username: "",
                password: "",
                confirm_password: "",
                email: "",
            }

        };
    },
    computed: {
        rules() {
            if (!this.state.is_login) {
                return {
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
                    ],
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                        {min: 1, max: 15, message: '用户名必须在 1 到 15 个字符之内', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 5, max: 25, message: '密码必须在 5 到 25 个字符之内', trigger: 'blur'}
                    ],
                    confirm_password: [
                        {
                            validator: (rule, value, callback) => {
                                if (this.form.password !== value) {
                                    callback("确认密码和密码不同")
                                } else {
                                    callback()
                                }
                            }
                        },
                        {required: true, message: '请输入确认密码', trigger: 'blur'},
                        {min: 5, max: 25, trigger: 'blur'}
                    ]
                }
            } else if (this.state.is_login && this.state.is_email) {
                return {
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
                    ],
                }
            } else {
                return {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                        {min: 1, max: 15, message: '用户名必须在 1 到 15 个字符之内', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 5, max: 25, message: '密码必须在 5 到 25 个字符之内', trigger: 'blur'}
                    ],
                }
            }
        }
    },
    methods: {
        async login() {
            const valid = await new Promise(resolve => {
                this.$refs.form_ref.validate((valid) => {
                    resolve(valid)
                })
            })

            if (!valid) {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: "请填写完整信息！",
                });
                return;
            }

            let loading = ElLoading.service();

            let res;
            if (this.state.is_login && !this.state.is_email) {
                res = await call_api(`user/login/${this.state.is_login === true ? "login" : "register"}_by_user`, {
                    username: this.form.username,
                    password: this.form.password
                });
            } else {
                res = await call_api(`user/login/${this.state.is_login === true ? "login" : "register"}_by_sms`, {
                    username: this.form.username,
                    password: this.form.password,
                    email: this.form.email,
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

            if (this.state.is_login) {
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "登录成功",
                })
            } else {
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "注册成功",
                })
            }

            // 登录/注册成功后跳转回原页面
            this.$router.back();
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
            <el-form ref="form_ref" :model="form" :rules="rules" label-position="top">
                <div class="text-[4vh] font-['SYST']">{{ state.is_login === true ? "登录" : "注册" }}</div>
                <el-form-item v-if="!this.state.is_login || !this.state.is_email"
                              class="my-[0.5vh] text-[2.5vh] font-['FZSX']"
                              label="用户名："
                              prop="username" @click="console.log(this.state)">
                    <el-input v-model="form.username" style="width: 100%;height:4vh;"/>
                </el-form-item>
                <el-form-item v-if="!state.is_login || this.state.is_email"
                              class="my-[0.5vh] text-[2.5vh] font-['FZSX']"
                              label="邮箱：" prop="email">
                    <el-input v-model="form.email"
                              style="width: 100%;height:4vh"/>
                </el-form-item>
                <el-form-item v-if="!this.state.is_login || !this.state.is_email"
                              class="my-[0.5vh] text-[2.5vh] font-['FZSX']"
                              label="密码：" prop="password">
                    <el-input v-model="form.password" style="width: 100%;height:4vh"
                              type="password"/>
                </el-form-item>
                <el-form-item v-if="!state.is_login" class="my-[0.5vh] text-[2.5vh] font-['FZSX']"
                              label="确认密码：" prop="confirm_password">
                    <el-input v-model="form.confirm_password"
                              style="width: 100%;height:4vh"
                              type="password"/>
                </el-form-item>
                <el-form-item>
                    <el-button round style="width: 100%;height: 4vh" type="primary" @click="login">
                        {{ state.is_login === true ? "登录" : "注册" }}
                    </el-button>
                </el-form-item>
                <!--    用户名密码登录      -->
                <div class="flex flex-row justify-between">
                    <div v-if="state.is_login" class="my-2" @click="this.state.is_login = false">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">注册</span>
                    </div>
                    <div v-if="!state.is_login || state.is_email" class="my-2"
                         @click="this.state.is_login = true; this.state.is_email = false">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">用户名登录</span>
                    </div>
                    <div v-if="!state.is_login || !state.is_email" class="my-2"
                         @click="this.state.is_login = true; this.state.is_email = true">
                        <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">邮箱登录</span>
                    </div>
                </div>
                <div>
                    <el-image alt="" src="/static/login/QQ登录.png"/>
                </div>
            </el-form>
        </div>
    </div>
</template>
