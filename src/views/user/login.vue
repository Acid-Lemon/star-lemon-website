<script>
import {call_api} from "../../utils/cloud.js";
import {load_user, store_token, store_user} from "../../utils/user_info";

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
                code: "",
            },
            code: {
                text: "获取验证码",
                disabled: false,
                wait_time: 60
            },
            QQ: {
                client_id: 102645267,
                redirect_uri: "https%3A%2F%2Fstar-lemon.top%2F%23%2Flogin",
            }
        };
    },
    watch: {
        '$route.query.code': {
            async handler(newValue, _oldValue) {
                if (newValue !== "") {
                    let res = call_api("user/login/login_with_qq", {
                        auth_code: newValue,
                        redirect_uri: this.QQ.redirect_uri
                    })

                    if (!res.success) {
                        return;
                    }

                    store_token(res.token);
                    await load_user();

                    ElNotification({
                        title: 'Success',
                        type: "success",
                        message: "登录成功",
                    })

                    this.$router.push("/");
                }
            },
            deep: true // 启用深度监听
        }
    },
    async mounted() {
    },
    computed: {
        rules() {
            const email = [
                {required: true, message: '请输入邮箱', trigger: 'blur'},
                {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
            ];
            const code = [
                {required: true, message: '请输入验证码', trigger: 'blur'},
            ];
            const username = [
                {required: true, message: '请输入用户名', trigger: 'blur'},
                {min: 1, max: 15, message: '用户名必须在 1 到 15 个字符之内', trigger: 'blur'}
            ];
            const password = [
                {required: true, message: '请输入密码', trigger: 'blur'},
                {min: 5, max: 25, message: '密码必须在 5 到 25 个字符之内', trigger: 'blur'}
            ];
            const confirm_password = [
                {
                    validator: (_rule, value, callback) => {
                        if (this.form.password !== value) {
                            callback("确认密码和密码不同")
                        } else {
                            callback()
                        }
                    }
                },
                {required: true, message: '请输入确认密码', trigger: 'blur'},
                {min: 5, max: 25, trigger: 'blur'}
            ];

            let res = null;
            if (!this.state.is_login) {
                res = {
                    email,
                    code,
                    username,
                    password,
                    confirm_password
                }
            } else if (this.state.is_login && this.state.is_email) {
                res = {
                    email,
                    code
                }
            } else {
                res = {
                    username,
                    password
                }
            }
            return res
        }
    },
    methods: {
        async common_login() {
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
            if (!this.state.is_login) {
                res = await call_api(`user/login/register_by_email`, {
                    username: this.form.username,
                    password: this.form.password,
                    email: this.form.email,
                    code: this.form.code
                });
            } else if (this.state.is_login && this.state.is_email) {
                res = await call_api(`user/login/login_by_email`, {
                    email: this.form.email,
                    code: this.form.code
                });
            } else if (this.state.is_login && !this.state.is_email) {
                res = await call_api(`user/login/login_by_user`, {
                    username: this.form.username,
                    password: this.form.password,
                });
            }

            loading.close();

            if (!res.success) {
                return;
            }

            if (this.state.is_login) {
                store_token(res.token);
                await load_user();
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "登录成功",
                })
            } else {
                store_token(res.token);
                store_user(res.data);
                ElNotification({
                    title: 'Success',
                    type: "success",
                    message: "注册成功",
                })
            }
            // 登录/注册成功后跳转回原页面
            this.$router.back();
        },
        async get_email_code() {
            this.code.disabled = true;

            let res = await call_api(`user/login/send_email_code`, {
                email: this.form.email,
                mode: this.state.is_login ? "登录" : "注册"
            })

            if (!res.success) {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: res,
                });
                this.code.disabled = false;
                return;
            }

            ElNotification({
                title: 'Success',
                type: "success",
                message: "验证码已发送",
            })

            let Interval = setInterval(() => {
                this.code.text = `${this.code.wait_time}s`;
                this.code.wait_time--;
                if (this.code.wait_time === 0) {
                    clearInterval(Interval);
                    this.code = {
                        text: "获取验证码",
                        disabled: false,
                        wait_time: 60
                    }
                }
            }, 1000)
        },
        QQ_login() {
            window.open(`https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${this.QQ.client_id}&redirect_uri=${this.QQ.redirect_uri}&state=login`, '_blank')
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
                <div class="text-[4vh] font-['SYST']">
                    {{ state.is_login === true ? "登录" : "注册" }}
                </div>
                <el-form-item v-if="!this.state.is_login || !this.state.is_email"
                              class="text-[2.5vh] font-['FZSX']"
                              label="用户名："
                              prop="username" @click="console.log(this.state)">
                    <el-input v-model="form.username" style="width: 100%;height:4vh;"/>
                </el-form-item>
                <el-form-item v-if="!this.state.is_login || this.state.is_email"
                              class="text-[2.5vh] font-['FZSX']"
                              label="邮箱：" prop="email">
                    <el-input v-model="form.email"
                              style="width: 100%;height:4vh"/>
                </el-form-item>
                <el-form-item v-if="!this.state.is_login || this.state.is_email"
                              class="text-[2.5vh] font-['FZSX']"
                              label="验证码：" prop="code">
                    <div class="flex flex-row justify-between">
                        <el-input v-model="form.code"
                                  style="width: 55%;height:4vh"/>
                        <el-button :disabled="code.disabled" style="width: 40%;height:4vh" @click="get_email_code">
                            {{ this.code.text }}
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item v-if="!this.state.is_login || !this.state.is_email"
                              class="text-[2.5vh] font-['FZSX']"
                              label="密码：" prop="password">
                    <el-input v-model="form.password" style="width: 100%;height:4vh"
                              type="password"/>
                </el-form-item>
                <el-form-item v-if="!state.is_login" class="text-[2.5vh] font-['FZSX']"
                              label="确认密码：" prop="confirm_password">
                    <el-input v-model="form.confirm_password"
                              style="width: 100%;height:4vh"
                              type="password"/>
                </el-form-item>
                <el-form-item>
                    <el-button round style="width: 100%;height: 4vh; margin-top: 10px" type="primary"
                               @click="common_login">
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
                <div class="flex flex-row justify-center">
                    <div class="my-2">
                        <span class="text-[2vh] font-['SYST']">第三方登录</span>
                    </div>
                </div>
                <div class="flex flex-row justify-center items-center">
                    <el-button circle @click="QQ_login">
                        <el-image alt="QQ登录" class="w-[1.8vh] h-[1.8vh]" src="/static/login/QQ登录.png"/>
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>
