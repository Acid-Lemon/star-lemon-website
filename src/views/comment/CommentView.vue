<script>
import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import {useInfiniteScroll} from "vue-hooks-plus";

import {date_format} from "@/src/utils/time";
import {get_user} from "@/src/utils/user_info";
import axios from "axios";
import {Message} from "@element-plus/icons-vue";

export default {
  components:{Message, useInfiniteScroll},
  data() {
    return {
      value: "",
      message_list: [],
      buttonDisabled: false,
      style_mode: false,
      pages: 0,
      sentences: null,
      loadingMore: false,
      hasMore: true,
    };
  },
  async mounted() {
    await this.get_sentences();
    await this.get_messages();
  },
  methods: {
    async get_sentences() {
      if (window.sessionStorage.getItem("sentences") === null) {
        axios.get(
            'https://v1.hitokoto.cn?c=j&encode=json'
        ).then((res) => {
          this.sentences = res.data;
          window.sessionStorage.setItem("sentences", JSON.stringify(res.data))
        });
      } else {
        this.sentences = JSON.parse(window.sessionStorage.getItem("sentences"));
      }
    },
    loadMore() {
      this.get_messages();
    },
    onFocus() {
      this.style_mode = true;
    },
    onBlur() {
      if (this.value === '') {
        this.style_mode = false;
      }
    },
    clear() {
      this.value = "";
      this.style_mode = false;
    },

    async messages_format(messages) {
      if (!messages) {
        return [];
      }

      return await Promise.all(messages.map((message) => {
        return new Promise((resolve) => {
          message.user.avatar_filename = message.user.avatar + ".jpg"
          message.create_at_format_str = date_format(new Date(message.create_at));
          resolve(message);
        })
      }));
    },
    async get_messages() {
      this.pages += 1;
      this.loadingMore = true;
      let start_time = 1577808000000;
      if (this.pages !== 1) {
        start_time = this.message_list[this.message_list.length - 1].create_at;
      }

      let res = await call_api("message_board/get_messages", {
        start_time,
        message_number: 20
      });

      if (!res.success) {
        if (res.code === "err_no_token") {
          ElNotification({
            title: 'Error',
            message: '请检查您的登陆状态',
            type: 'error',
          })
        } else {
          ElNotification({
            title: 'Error',
            message: '获取留言失败',
            type: 'error',
          });
        }
        this.pages -= 1;
        this.loadingMore = false;
        return;
      }

      this.loadingMore = false;
      this.hasMore = res.data.messages.length === 20;

      this.message_list = this.message_list.concat(await this.messages_format(res.data.messages));
    },

    check_message(message) {
      if (message.length === 0) {
        ElNotification({
          title: 'Error',
          type: "error",
          message: "留言不能为空噢!",
        });
        return false;
      }

      return true;
    },
    async publish_message() {
      this.buttonDisabled = true;

      let message = this.value;
      if (!this.check_message(message)) {
        this.buttonDisabled = false;
        return;
      }

      let res = await call_api("message_board/create_message", {
        content: message,
      });

      if (res.api_call_success) {
        this.value = "";
        this.buttonDisabled = false;
      }

      if (!res.success) {
        ElNotification({
          title: 'Error',
          type: "error",
          message: res.error_message,
        });

        return;
      }

      let new_message = {
          id: res.data.id,
		  content: message,
		  create_at: res.data.create_at,
		  public_state: res.data.public_state
      };
      let user = get_user();
      new_message.user = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      };

      let new_message_format = (await this.messages_format([new_message]))[0];
      this.message_list.push(new_message_format);

      ElNotification({
        title: 'Success',
        type: "success",
        message: "发送成功"
      });
      this.buttonDisabled = false;
      this.style_mode = false;
    }
  }
}
</script>

<template>
  <div class="w-full h-full">
    <div
        class="bg-[url('/static/background/11.jpg')] bg-cover w-full md:h-[40%] flex flex-col items-center justify-center h-[30%]">
      <p class="text-[#000000] font-['SYST'] text-[6vh] hover:text-[#44cef6] duration-700">
        留言板
      </p>
    </div>
    <div class="flex flex-col items-center justify-center bg-[#F8FAFD]">
      <div
          class="border border-[#000000] m-[5vh] h-[30vh] md:w-[70%] w-[85%] flex flex-col items-center justify-center">
        <div class="relative top-[-2.5vh] bg-[#F8FAFD]">
          <p class="mx-[1vw] text-[3.6vh] font-['RGBZ']">网易云音乐热评</p>
        </div>
        <div class="w-full h-full flex flex-col items-center justify-center">
          <p class="text-[2.4vh] m-[2vh] font-['FZSX']">
            {{ sentences?.hitokoto }}
          </p>
          <p class="text-[1.9vh] m-[2vh] font-['FZSX']">——{{ sentences?.from }}</p>
        </div>
      </div>
      <p class="mx-[2vh] font-serif text-[2.4vh]">
        很感谢你能访问该页面，如果你有什么和我们说的，或者有什么问题想问的，可以随时在下面评论噢~！我们看见了会第一时间回复你的。
      </p>
      <div class="flex flex-row md:w-[70%] w-[85%] mt-[2vh] border-b-[1px] border-[#000000]">
        <div class="flex flex-row items-end">
          <span class="text-[4vh] font-bold font-['RGBZ']">comment</span>
          <span class="text-[2vh] mb-[1vh] mx-[2vh] font-['FZSX']">{{ message_list.length }}条评论</span>
        </div>
      </div>
      <div v-infinite-scroll="get_messages" :infinite-scroll-disabled=!hasMore infinite-scroll-delay=1000 class="h-full w-full flex flex-col items-center">
        <div v-for="message in message_list" :key="message.id"
             class="my-[1em] flex flex-col items-center w-full">
          <div class="border border-[#000000] md:w-[70%] w-[85%] shadow-md bg-[#FFFFFF]">
            <div class="flex flex-row mt-[1vh] ml-[1vh]">
              <el-avatar style="width:5.4vh;height:5.4vh" :src="message.user.avatar_filename">{{ message.user.name }}
              </el-avatar>
              <div class="flex flex-col ml-[1vh]">
                <p class="text-[2vh] font-['SYST']">{{ message.user.name }}</p>
                <p class="text-[1.6vh] font-['SYST'] text-[#000000] opacity-80">{{ message.create_at_format_str }}</p>
              </div>
            </div>
            <p class="m-[1vh] text-[2vh] font-['SYST']">{{ message.content }}</p>
          </div>
        </div>
        <div class="text-[3vh] font-['RGBZ']" v-if="loadingMore">正在加载中</div>
        <div class="text-[3vh] font-['RGBZ']" v-if="!hasMore">没有更多留言惹</div>
        <div class="w-[70%]"><el-divider content-position="left">列车已到站</el-divider></div>
      </div>
      <div class="my-[3vh] flex flex-col justify-center md:w-[70%] w-[85%]">
        <div class="mb-[3vh] relative">
          <p :class="{'text-[#FFFFFF]':style_mode,'bg-black':style_mode,'text-[1.6vh]':style_mode,'top-[-1.2vh]':style_mode,'left-[1.4vh]':style_mode,
            'text-[#000000]':!style_mode,'bg-white':!style_mode,'text-[2vh]':!style_mode,'top-[1vh]':!style_mode,'left-[1vh]':!style_mode}
            " class="absolute pointer-events-none px-[1vh] duration-700 z-50">
            你是我一生只会遇见一次的惊喜...
          </p>
          <textarea id="pl" v-model="value"
                    class="w-full h-[20vh] p-[2vh] border border-[#000000] min-h-[20vh] bg-[#FFFFFF] shadow-md"
                    type="text" @blur="onBlur" @focus="onFocus"></textarea>
        </div>
        <div class="w-full flex flex-row justify-around">
          <el-button round style="width: 200px;height: 40px" type="primary" @click="publish_message">发布</el-button>
          <el-button round style="width: 200px;height: 40px" @click="clear">清除</el-button>
        </div>
        <div class="h-[50px] w-full my-[50px]"></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
