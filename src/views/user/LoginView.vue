<script>
import {call_api} from "../../utils/cloud.js";
import { useLoginStateStore } from '../../stores/loginState';

import {ElLoading, ElNotification} from "element-plus";

export default {
  data() {
    return {
      state: {
        text: "登录",
        id: "login",
        value: true,// 登录和注册，登陆状态是true，注册状态是false
        mode: true,// 用户名登录和手机号登录，用户名登录是true，手机号登录是false
      },
      username: "",
      password: "",
      confirm_password: "",
      phone_number: "",
      code: "",
      username_tip: "",
      password_tip: "",
      confirm_password_tip: "",
      phone_number_tip: "",
      code_tip: "",
      codeState:false
    };
  },
  methods: {
    register_mode() {
      this.state.value = false;
      this.state.text = "注册";
      this.state.id = "register";
      this.phone_number_tip="如若没有可不填";
    },
    username_mode() {
      this.state.value = true;
      this.state.mode = true;
      this.state.text = "登录";
      this.state.id = "login";
    },
    phone_number_mode() {
      this.state.value = true;
      this.state.mode = false;
      this.state.text = "登录";
      this.state.id = "login";
      this.phone_number_tip="";

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
      this.codeState = true;

      if (!(/^1[3456789]\d{9}$/.test(this.phone_number))) {
        ElNotification({
          title: 'Warning',
          type: "warning",
          message: "手机号格式错误",
        });

        this.codeState = false;
        return;
      }

      let res = await call_api("user/login/send_code", {
        phone_number: this.phone_number,
        mode: this.state.text
      });

      if (res.success) {
        ElNotification({
          title: 'Success',
          type: "success",
          message: "发送成功",
        });
      } else {
        ElNotification({
          title: 'Error',
          type: "error",
          message: "发送失败：" + res.code,
        });
      }
      this.codeState = false;
    },
    async login() {
      if (this.state.value === false) {
        if (!this.check()) {
          return;
        }
      }

      if (this.phone_number && !this.code) {
        ElNotification({
          title: 'Warning',
          type: "warning",
          message: "未获取验证码",
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
        ElNotification({
          title: 'Error',
          type: "error",
          message: res.error_message,
        });

        if (!res.api_call_success) {
          this.username = "";
          this.password = "";
          this.confirm_password = "";
        }

        return;
      }

      ElNotification({
        title: 'Success',
        type: "success",
        message: "登录成功",
      })

      const loginStateStore = useLoginStateStore();
      loginStateStore.changeLoginState();

      // 登录成功后跳转回原页面
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
    <div class="bg-[#FFFFFF]/80 md:w-[360px] w-[95vw] h-[85vh] shadow-sm rounded-lg p-[3vh] mt-[12vh] mb-[3vh]">
      <div class="w-full h-full">
        <span class="text-[4vh] font-['SYST']">{{ state.text }}</span>
        <div class="my-[2vh] flex flex-col justify-between align-top w-full">
          <!--    注册或用户名密码登录        -->
          <div v-if="!state.value || (state.mode && state.value)" class="flex flex-col">
            <span class="my-[0.5vh] text-[2vh] font-['FZSX']">用户名：</span>
            <el-input v-model="username" :placeholder="username_tip"
                      style="width: 100%;height:4vh;"/>
          </div>
          <!--    手机号登录注册或用户名注册        -->
          <div v-if="!state.mode || !state.value" class="flex flex-col">
            <span class="my-[0.5vh] text-[2vh] font-['FZSX']">手机号码：</span>
            <el-input v-model="phone_number" :placeholder="phone_number_tip" style="width: 100%;height:4vh"/>
          </div>
          <!--    手机号登录注册或用户名注册        -->
          <div v-if="!state.mode || !state.value" class="flex flex-col">
            <span class="my-[0.5vh] text-[2vh] font-['FZSX']">验证码：</span>
            <div class="flex flex-row justify-between">
              <el-input v-model="code" :placeholder="code_tip" style="width: 50%;height:4vh"/>
              <el-button round style="width: 40%;height: 4vh" @click="send_code" :disabled="codeState">获取验证码</el-button>
            </div>
          </div>
          <!--     注册或用户名密码登录       -->
          <div v-if="!state.value || (state.mode && state.value)" class="flex flex-col">
            <span class="my-1 text-[2vh] font-['FZSX']">密码：</span>
            <el-input v-model="password" :placeholder="password_tip" style="width: 100%;height:4vh" type="password"/>
          </div>
          <!--      注册      -->
          <div v-if="!state.value" class="flex flex-col">
            <span class="my-1 text-[2vh] font-['FZSX']">确认密码：</span>
            <el-input v-model="confirm_password" :placeholder="confirm_password_tip" style="width: 100%;height:4vh"
                      type="password"/>
          </div>
        </div>
        <el-button round style="width: 100%;height: 4vh" type="primary" @click="login">{{ state.text }}</el-button>
        <!--    用户名密码登录      -->
        <div v-if="state.value && state.mode" class="flex flex-row justify-between">
          <div class="my-2" @click="register_mode">
            <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">注册</span>
          </div>
          <div class="my-2" @click="phone_number_mode">
            <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">手机号登录</span>
          </div>
        </div>
        <div v-if="!state.value" class="flex flex-row justify-between">
          <div class="my-2" @click="username_mode">
            <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">用户名登录</span>
          </div>
          <div class="my-2" @click="phone_number_mode">
            <span class="text-[#40A2E3] text-[1.8vh] font-['FZSX']">手机号登录</span>
          </div>
        </div>
        <div v-if="state.value && !state.mode" class="flex flex-row justify-between">
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