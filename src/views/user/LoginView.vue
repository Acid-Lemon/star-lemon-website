<template>
	<div
		class="bg-[url('/static/background/22.jpg')] h-dvh bg-cover flex flex-row justify-between items-center p-[5vh]">
		<div class="md:block hidden w-[100%]">
			<div class="flex flex-col items-center">
				<span class="font-['RGBZ'] text-[5vw] text-[#FFFFFF]">“海阔凭鱼跃，</span>
				<span class="font-['RGBZ'] text-[5vw] text-[#FFFFFF] pl-[20%]">天高任鸟飞。”</span>
			</div>
		</div>
		<div class="bg-[#FFFFFF]/50 md:w-[360px] w-[95vw] h-[85vh] shadow-sm rounded-lg p-[3vh] mt-[12vh] mb-[3vh]">
			<div class="w-full h-full">
				<span class="text-[4vh] font-['SYST']">{{ state.text }}</span>
				<div class="my-[2vh] flex flex-col justify-between align-top w-full">
					<!--    注册或用户名密码登录        -->
					<div class="flex flex-col" v-if="!state.value || (state.mode && state.value)">
						<span class="my-[0.5vh] text-[2vh] font-['SJJS']">用户名：</span>
						<input type="text" class="my-[0.5vh] text-[2vh] border border-[#000000] h-[3vh] font-['SJJS']"
							v-model="username" :placeholder="username_tip" />
					</div>
					<!--    手机号登录注册或用户名注册        -->
					<div class="flex flex-col" v-if="!state.mode || !state.value">
						<span class="my-[0.5vh] text-[2vh] font-['SJJS']">手机号码：</span>
						<input type="text" class="my-[0.5vh] text-[2vh] border border-[#000000] h-[3vh] font-['SJJS']"
							v-model="phone_number" :placeholder="phone_number_tip" />
					</div>
					<!--    手机号登录注册或用户名注册        -->
					<div class="flex flex-col" v-if="!state.mode || !state.value">
						<span class="my-[0.5vh] text-[2vh] font-['SJJS']">验证码：</span>
						<div class="flex flex-row justify-between">
							<input type="text" class="my-[0.5vh] w-[40%] border border-[#000000] h-[3vh] font-['SJJS']"
								v-model="code" :placeholder="code_tip" />
							<button
								class="w-[50%] h-[3.2vh] leading-[3.2vh] m-1 border rounded-full border-[#000000] text-[1.5vh] font-['SJJS']"
								@click="send_code">
								获取验证码
							</button>
						</div>
					</div>
					<!--     注册或用户名密码登录       -->
					<div class="flex flex-col" v-if="!state.value || (state.mode && state.value)">
						<span class="my-1 text-[2vh] font-['SJJS']">密码：</span>
                        <input type="password" class="my-1 border border-[#000000] h-[3vh] font-['SJJS']"
							v-model="password" :placeholder="password_tip" />
					</div>
					<!--      注册      -->
					<div class="flex flex-col" v-if="!state.value">
						<span class="my-1 text-[2vh] font-['SJJS']">确认密码：</span>
						<input type="password" class="my-1 border border-[#000000] h-[3vh] font-['SJJS']"
							v-model="confirm_password" :placeholder="confirm_password_tip" />
					</div>
				</div>
				<button
					class="my-1 w-full rounded-full border border-[#000000] text-[2vh] font-['SJJS'] h-[4vh] leading-[4vh]"
					@click="login">
					{{ state.text }}
				</button>
				<!--    用户名密码登录      -->
				<div class="flex flex-row justify-between" v-if="state.value && state.mode">
					<div class="my-2" @click="register_mode">
						<span class="text-[#40A2E3] text-[1.8vh] font-['SJJS']">注册</span>
					</div>
					<div class="my-2" @click="phone_number_mode">
						<span class="text-[#40A2E3] text-[1.8vh] font-['SJJS']">手机号登录</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		call_api
	} from "@/src/utils/cloud.js";
	import {
		store_user
	} from "@/src/utils/user_info";

	import {
		ElLoading,
		ElMessageBox
	} from "element-plus";

	export default {
		data() {
			return {
				state: {
					text: "登录",
					id: "login",
					// 登录和注册，登陆状态是true，注册状态是false
					value: true,
					// 用户名登录和手机号登录，用户名登录是true，手机号登录是false
					mode: true,
				},
				username: "",
				password: "",
				confirm_password: "",
				phone_number: "",
				code: "",
				username_tip: "",
				password_tip: "",
				confirm_password_tip: "",
				phone_number_tip: "如若没有可不填",
				code_tip: ""
			};
		},
		methods: {
			register_mode() {
				this.state.value = false;
				this.state.text = "注册";
				this.state.id = "register";
			},
			phone_number_mode() {
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
				if (!(/^1[3456789]\d{9}$/.test(this.phone_number))) {
					await ElMessageBox({
						type: "warning",
						message: "手机号格式错误",
						confirmButtonText: "确定",
						autofocus: true
					});
					return;
				}

				let res = await call_api("user/login/send_code", {
					phone_number: this.phone_number
				});

				if (res.success) {
					await ElMessageBox({
						type: "success",
						message: "发送成功",
						confirmButtonText: "确定",
						autofocus: true
					});
				} else {
					await ElMessageBox({
						type: "error",
						message: "发送失败：" + res.error_message,
						confirmButtonText: "确定",
						autofocus: true
					});
				}
			},
			async login() {
				if (this.state.value === false) {
					if (!this.check()) {
						return;
					}
				}

				if (this.phone_number && !this.code) {
					await ElMessageBox({
						type: "warning",
						message: "未获取验证码",
						confirmButtonText: "确定",
						autofocus: true
					});

					return;
				}

				if (this.state.value === false) {
					// noinspection RedundantConditionalExpressionJS
					this.state.mode = this.phone_number ? false : true;
				}

				let loading = ElLoading.service();
				let res;
				if (this.state.mode === true) {
					res = await call_api(`user/login/${this.state.value === true ? "login" : "register"}_by_user`, {
						username: this.username,
						password: this.password
					});
				} else {
					res = await call_api(`user/login/${this.state.value === true ? "login" : "register"}_by_sms`, {
						username: this.username,
						password: this.password,
						phone_number: this.phone_number,
						code: this.code
					});
				}

				loading.close();

				if (res.success === false) {
					// 显示错误
					await ElMessageBox({
						type: "error",
						message: res.error_message,
						confirmButtonText: "确定",
						autofocus: true
					});

					if (!res.api_call_success) {
						this.username = "";
						this.password = "";
						this.confirm_password = "";
					}

					return;
				}

				ElMessageBox({
					type: "success",
					message: "登录成功",
					showCancelButton: false,
					confirmButtonText: "确定",
					autofocus: true,
					callback: () => {
						this.$router.back();
					}
				}).catch();
			}
		}
	}
</script>
