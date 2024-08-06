<script>
import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";

import {date_format} from "@/src/utils/time";

import axios from "axios";
import {Message} from "@element-plus/icons-vue";

import {use_user_info_store} from "../../stores/userInfo";

export default {
  components:{Message},
  data() {
    return {
      value: "",
      message_list: [],
      is_disabled: false,
      is_focus: false,
      pages: 0,
      sentences: null,
      loading_more: false,
      has_more: true,
      emoji:[
        {
          value:"**doge**",
          path:"/static/emoji/doge.png",
        },
        {
          value:"**OK**",
          path:"/static/emoji/OK.png",
        },
        {
          value:"**偷笑**",
          path:"/static/emoji/偷笑.png",
        },
        {
          value:"**傲娇**",
          path:"/static/emoji/傲娇.png",
        },
        {
          value:"**冷**",
          path:"/static/emoji/冷.png",
        },
        {
          value:"**吃瓜**",
          path:"/static/emoji/吃瓜.png",
        },
        {
          value:"**哈欠**",
          path:"/static/emoji/哈欠.png",
        },
        {
          value:"**哦呼**",
          path:"/static/emoji/哦呼.png",
        },
        {
          value:"**喜极而泣**",
          path:"/static/emoji/喜极而泣.png",
        },
        {
          value:"**喜欢**",
          path:"/static/emoji/喜欢.png",
        },
        {
          value:"**大哭**",
          path:"/static/emoji/大哭.png",
        },
        {
          value:"**大笑**",
          path:"/static/emoji/大笑.png",
        },
        {
          value:"**奋斗**",
          path:"/static/emoji/奋斗.png",
        },
        {
          value:"**奶茶干杯**",
          path:"/static/emoji/奶茶干杯.png",
        },
        {
          value:"**妙啊**",
          path:"/static/emoji/妙啊.png",
        },
        {
          value:"**委屈**",
          path:"/static/emoji/委屈.png",
        },
        {
          value:"**害羞**",
          path:"/static/emoji/害羞.png",
        },
        {
          value:"**尴尬**",
          path:"/static/emoji/尴尬.png",
        },
        {
          value:"**干杯**",
          path:"/static/emoji/干杯.png",
        },
        {
          value:"**微笑**",
          path:"/static/emoji/微笑.png",
        },
        {
          value:"**惊喜**",
          path:"/static/emoji/惊喜.png",
        },
        {
          value:"**惊讶**",
          path:"/static/emoji/惊讶.png",
        },
        {
          value:"**打call**",
          path:"/static/emoji/打call.png",
        },
        {
          value:"**抓狂**",
          path:"/static/emoji/抓狂.png",
        },
        {
          value:"**拥抱**",
          path:"/static/emoji/拥抱.png",
        },
        {
          value:"**捂脸**",
          path:"/static/emoji/捂脸.png",
        },
        {
          value:"**撇嘴**",
          path:"/static/emoji/撇嘴.png",
        },
        {
          value:"**支持**",
          path:"/static/emoji/支持.png",
        },
        {
          value:"**无语**",
          path:"/static/emoji/无语.png",
        },
        {
          value:"**星星眼**",
          path:"/static/emoji/星星眼.png",
        },
        {
          value:"**滑稽**",
          path:"/static/emoji/滑稽.png",
        },
        {
          value:"**热**",
          path:"/static/emoji/热.png",
        },
        {
          value:"**爱心**",
          path:"/static/emoji/爱心.png",
        },
        {
          value:"**生气**",
          path:"/static/emoji/生气.png",
        },
        {
          value:"**生病**",
          path:"/static/emoji/生病.png",
        },
        {
          value:"**疑惑**",
          path:"/static/emoji/疑惑.png",
        },
        {
          value:"**疼**",
          path:"/static/emoji/疼.png",
        },
        {
          value:"**笑哭**",
          path:"/static/emoji/笑哭.png",
        },
        {
          value:"**给心心**",
          path:"/static/emoji/给心心.png",
        },
        {
          value:"**胜利**",
          path:"/static/emoji/胜利.png",
        },
        {
          value:"**脱单doge**",
          path:"/static/emoji/脱单doge.png",
        },
        {
          value:"**调皮**",
          path:"/static/emoji/调皮.png",
        },
        {
          value:"**辣眼睛**",
          path:"/static/emoji/辣眼睛.png",
        },
        {
          value:"**酸了**",
          path:"/static/emoji/酸了.png",
        },
        {
          value:"**难过**",
          path:"/static/emoji/难过.png",
        },
        {
          value:"**雪花**",
          path:"/static/emoji/雪花.png",
        },
        {
          value:"**鸡腿**",
          path:"/static/emoji/鸡腿.png",
        },
        {
          value:"**鼓掌**",
          path:"/static/emoji/鼓掌.png",
        }
      ],
    };
  },
  async mounted() {
    await this.get_sentences();
    await this.get_messages();
  },
  computed: {
    style_mode() {
      return !(this.value === '' && this.is_focus === false);
    },
    state() {
      return !this.has_more || this.loading_more
    },
    is_login() {
      const user_infoStore = use_user_info_store();
      return user_infoStore.user_info !== null;
    },
    user_info() {
      const user_infoStore = use_user_info_store();
      return user_infoStore.user_info;
    },
  },
  watch: {
  },
  methods: {
    async get_sentences() {
      if (!window.sessionStorage.getItem("sentences")) {
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
    on_focus() {
      this.is_focus = true;
    },
    on_blur() {
      this.is_focus = false;
    },
    clear() {
      this.value = "";
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
      this.loading_more = true;
      this.pages += 1;
      let start_time = new Date().getTime();
      let skip_number = 0;
      if (this.pages !== 1) {
        start_time = this.message_list[this.message_list.length - 1].create_at;
        skip_number = this.skip_number();
      }

      let res = await call_api("message_board/get_personal_and_public_messages", {
        time_range: {
          from_time: start_time,
          to_time: 0
        },
        message_number: 20,
        skip_number
      });

      if (!res.success) {
        ElNotification({
          title: 'Error',
          message: '获取留言失败',
          type: 'error',
        });
        this.pages -= 1;
        this.loading_more = false;
        return;
      }

      this.message_list = this.message_list.concat(await this.messages_format(res.data.messages));
      console.log(this.message_list);

      this.loading_more = false;
      this.has_more = res.data.messages.length === 20;
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
      this.is_disabled = true;

      let message = this.value;

      if (!this.is_login) {
        ElNotification({
          title: 'Error',
          type: "error",
          message: "请先进行登录",
        });
        this.is_disabled = false;
        return;
      }

      if (!this.check_message(message)) {
        this.is_disabled = false;
        return;
      }

      let res = await call_api("message_board/create_message", {
        content: message,
      });

      if (res.api_call_success) {
        this.value = "";
        this.is_disabled = false;
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
      new_message.user = {
        id: this.user_info.id,
        name: this.user_info.name,
        avatar: this.user_info.avatar
      };

      this.message_list.unshift(await this.messages_format([new_message]));

      ElNotification({
        title: 'Success',
        type: "success",
        message: "发送成功"
      });
      this.is_disabled = false;
    },
    emoji_divide(text) {
      let li = [];
      let emoji_re = /\*\*(.*?)\*\*/;

      while (text.length) {
        let match_res = emoji_re.exec(text);
        if (match_res === null) {
          li.push({type: "text", words: text});
          break;
        }
        let match_full_text = match_res[0];
        let match_text = match_res[1];
        if (match_res.index > 0) {
          li.push({type: "text", words: text.substring(0, match_res.index)});
        }
        text = text.slice(match_res.index + match_full_text.length);
        li.push({type: "emoji", words: match_text});
      }

      return li;
    },
    skip_number() {
      let index = 1;
      while(this.message_list[this.message_list.length - index].create_at === this.message_list[this.message_list.length - index - 1].create_at) {
        index += 1;
      }
      return index;
    },
  }
}
</script>

<template>
  <el-scrollbar>
  <div class="w-full h-full">
    <div
        class="bg-[url('/static/background/11.jpg')] bg-center bg-cover w-full md:h-[40vh] flex flex-col items-center justify-center h-[30vh]">
      <p class="text-[#FFFFFF] font-['FZSX'] text-[6vh] hover:text-[#44cef6] duration-700">
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
          <p class="text-[1.9vh] m-[2vh] font-['FZSX']">——『{{ sentences?.from }}』{{ sentences?.from_who === null ? '未知' : sentences?.from_who }}</p>
        </div>
      </div>
      <p class="mx-[2vh] font-serif text-[2.4vh]">
        很感谢你能访问该页面，如果你有什么和我们说的，或者有什么问题想问的，可以随时在下面评论噢~！我们看见了会第一时间回复你的。
      </p>
      <div class="md:w-[70%] w-[85%] mt-[30px] flex flex-row justify-evenly items-center bg-[url('/static/background/17.jpg')] bg-cover rounded-xl shadow-md relative">
        <div class="md:flex md:flex-col md:items-center md:justify-between h-[6vw] hidden self-start mt-[4vh]">
          <el-avatar style="width: 4vw;height:4vw">{{ user_info?.name === undefined ? '未登录' : user_info?.name }}</el-avatar>
          <div class="font-['SYST']">{{ user_info?.name === undefined ? '未登录' : user_info?.name }}</div>
      </div>
      <div class="my-[3vh] flex flex-col justify-center md:w-[85%] w-[90%]">
        <div class="mb-[3vh] relative">
          <p :class="{'text-[#FFFFFF] bg-opacity-100 text-[1.6vh] top-[-1.2vh] left-[1.4vh]':style_mode,
            'text-[#000000] bg-opacity-0 text-[2vh] top-[1vh] left-[1vh]':!style_mode}
            " class="absolute pointer-events-none px-[1vh] duration-700 z-50 bg-black font-['FZSX']">
            你是我一生只会遇见一次的惊喜...
          </p>
          <textarea id="pl" v-model.lazy="value" maxlength="100"
                    class="w-full h-[20vh] p-[2vh] border border-[#000000] min-h-[20vh] bg-[#FFFFFF] shadow-md bg-opacity-50 font-['SYST']"
                    type="text" @blur="on_blur" @focus="on_focus"></textarea>
        </div>
        <div class="w-full flex flex-row justify-around md:justify-end">
          <el-button round style="width: 150px;height: 40px" @click="clear">清除</el-button>
          <el-button round style="width: 150px;height: 40px" type="primary" @click="publish_message">发布</el-button>
        </div>
        <div class="absolute bottom-[2vh] left-[16vh] w-[5vh] h-[5vh]">
        <el-popover
                     placement="top"
                     :width="450"
        >
          <template #reference>
            <img src="/static/emoji/doge.png" class="w-[5vh] h-[5vh] absolute top-[-20px]" alt="表情"/>
          </template>
          <div class="grid gap-x-[10px] gap-y-[10px] grid-cols-8">
              <img v-for="i in emoji" :src="i.path" class="w-[30px] h-[30px]" @click="this.value += i.value" alt="emoji">
          </div>
        </el-popover>
        </div>
      </div>
      </div>
      <div class="flex flex-row md:w-[70%] w-[85%] mt-[2vh] border-b-[1px] border-[#000000]">
        <div class="flex flex-row items-end">
          <span class="text-[4vh] font-bold font-['RGBZ']">comment</span>
          <span class="text-[2vh] mb-[1vh] mx-[2vh] font-['FZSX']">{{ message_list.length }}条评论</span>
        </div>
      </div>
      <div v-infinite-scroll="get_messages" :infinite-scroll-disabled="state" infinite-scroll-delay=1000 infinite-scroll-distance=100 class="h-full w-full flex flex-col items-center">
        <div v-for="message in message_list" :key="message.id"
             class="my-[1em] flex flex-col items-center w-full">
          <div class="border border-[#000000] md:w-[70%] w-[85%] shadow-md bg-[#FFFFFF]">
            <div class="flex flex-row mt-[1vh] ml-[1vh]">
              <el-avatar style="width:5.4vh;height:5.4vh" :src="message.user.avatar_filename">{{ message.user.name }}
              </el-avatar>
              <div class="flex flex-col ml-[1vh]">
                <div class="text-[2.2vh] font-['SYST']">{{ message.user.name }}</div>
                <div class="text-[1.6vh] font-['SYST'] text-[#000000] opacity-80">{{ message.create_at_format_str }}</div>
              </div>
            </div>
            <div class="p-[1vh] flex flex-row items-center">
              <div v-for="split_content in emoji_divide(message.content)" class="flex flex-row items-center">
                <span v-if="split_content.type==='text'" class="text-[2vh] font-['SYST']">{{ split_content.words }}</span>
                <el-image v-if="split_content.type==='emoji'" :src="'/static/emoji/' + split_content.words + '.png'" class="w-[3vh] h-[3vh]"></el-image>
              </div>
            </div>
          </div>
        </div>
        <div class="text-[3vh] font-['RGBZ']" v-if="loading_more">正在加载中</div>
        <div class="text-[3vh] font-['RGBZ']" v-if="!has_more">没有更多留言惹</div>
        <div class="w-[70%]"><el-divider content-position="left">列车已到站</el-divider></div>
      </div>
      <div class="h-[50px] w-full my-[50px]"></div>
    </div>
  </div>
  </el-scrollbar>
</template>
<style scoped>
</style>
