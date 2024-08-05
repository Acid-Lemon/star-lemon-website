<script>
import {
  ArrowLeftBold,
  ArrowRightBold,
  CaretLeft, CaretRight,
  DCaret,
  DocumentDelete,
  VideoPause,
  VideoPlay
} from "@element-plus/icons-vue";
import axios from "axios";
import {truncate_text} from "../utils/truncate_text";

export default {
  name: 'MusicPlayer',
  components: {CaretRight, CaretLeft, DCaret, DocumentDelete, VideoPause, VideoPlay, ArrowRightBold, ArrowLeftBold},
  data() {
    return {
      value: 0,
      inner_audio_context: null,
      play_state: 'pause',
      random_index: 0,
      lyric_list: [],
      display_state: false,
      music_list: [
        'LOVE U 2 - 陈伟霆',
        '偏爱 - 张芸京',
        '无名的人 - 毛不易',
        '红色高跟鞋 - 蔡健雅',
        '我好像在哪里见过你 - 薛之谦',
        '你在，不在 - 郭采洁',
        'Letting go - 蔡健雅',
        '阿嚒 - 周林枫',
        '富士山下 - 陈奕迅',
        '此生不换 - 青鸟飞鱼',
        '你瞒我瞒 - 陈伯宇',
        '起风了 - 卖辣椒也用券',
        '情歌 - 梁静茹',
        '小美满 - 周深',
        '岁月神偷 - 金玟岐',
        '有形的翅膀 - 张韶涵',
        '不如见一面 - 海来阿木',
        '稻香 - 周杰伦',
        '你若成风 - 许嵩&莫诗旎',
        '指纹 - 杜宣达',
        '上春山 - 张超',
        '小城夏天 - LBI利比（时柏尘）',
        '西楼儿女 - 海来阿木',
        '紫荆花盛开 - 叶梓晴&菜圆圆',
        '云边有个小卖部 - 张靓颖',
        '那些花儿 - 朴树',
        '困在情绪天 - Zakiya晴子&逸云&歪歪超',
        '阳光铺满青草地，而我拥抱你 - 黄熠',
        '心许百年 - 王天戈',
        '十二月的奇迹 - 呆呆破',
        '法兰西多士 - 告五人',
        '流れ行く云 (流行的云) - 岸部真明',
        '明天过后 - 伯远',
        '相信未来 - MIC男团',
        '加油 - 林俊杰&MC HotDog 热狗',
        '有光 - 卖辣椒也用券',
        '在日落前出发 - 江迟同学',
        '白色连衣裙 - 黑松&Catstar&80Notears',
        '日落的告白 - Kui Kui、于子璐',
        '记·念(2023青春不散版) - 雷雨心',
        '借过 - 印子月',
        '天気の子 - Amison',
        '金榜题名 - coco这个李文',
        '第一次遇见花香的那刻 - 7paste',
        '云边的风筝 - 周深',
        '私奔 - 郑钧',
        '奇怪吗 - 晚山',
        '最后一击 - 莫海彤',
        '如何 - 添儿呗'
      ],
      music_info: {
        cover: '',
        name: '',
        singer: '',
        src: '',
        lyric: ''
      }
    }
  },
  async mounted() {
    this.inner_audio_context = uni.createInnerAudioContext();
    this.inner_audio_context.volume = 0.5;
    await this.switchMusic();
    this.inner_audio_context.onPlay(() => {
      this.play_state = 'play';
      this.inner_audio_context.onTimeUpdate(() => {
        this.value = this.inner_audio_context.currentTime;
        this.setOffset()
      });
    });
    this.inner_audio_context.onPause(() => {
      this.play_state = 'pause'
    });
    this.inner_audio_context.onEnded(async () => {
      await this.switchMusic();
      await this.play();

    });
  },
  onUnload() {
  },
  computed: {


  },
  watch: {},
  methods: {
    truncate_text,
    async get_music(n) {
      // 获取音乐信息    API源于：龙珠API https://www.hhlqilongzhu.cn
        await axios.get(
          `https://www.hhlqilongzhu.cn/api/dg_qqmusic.php?gm=${this.music_list[n]}&n=1`
        ).then((res) => {
            this.music_info.cover = res.data.split('\n')[0].slice(5, -1);
            this.music_info.name = res.data.split('\n')[1].slice(3);
            this.music_info.singer = res.data.split('\n')[2].slice(3);
            this.music_info.src = res.data.split('\n')[4].slice(5)
        })
    },
    async get_lyric(n) {
      // 获取音乐歌词    API源于：龙珠API https://www.hhlqilongzhu.cn
      await axios.get(
          `https://www.hhlqilongzhu.cn/api/dg_geci.php?msg=${this.music_list[n]}&n=1&type=2`
      ).then((res) => {
        this.music_info.lyric = res.data;
      });
    },
    async play() {
      this.inner_audio_context.play();
      this.deleteLyricElements();
      await this.get_lyric(this.random_index);
      this.readLyrics(this.music_info.lyric);
      this.createLyricElements();
    },
    pause() {
      this.inner_audio_context.pause();
    },
    musicTime(duration) {
      if(!duration) {
        return '00:00'
      }
      let f = Math.floor(duration / 60)
      if (f.toString().length === 1) {
        f = '0' + f;
      }
      let m = Math.floor(duration % 60)
      if (m.toString().length === 1) {
        m = '0' + m;
      }
      return `${f}:${m}`
    },
    change() {
      if (this.value - this.inner_audio_context.currentTime > 2 || this.value - this.inner_audio_context.currentTime < -2) {
        this.inner_audio_context.seek(this.value)
      }
      return 0;
    },
    toggleDisplay() {
      this.display_state = !this.display_state;
    },
    async switchMusic() {
      this.random_index = Math.floor(Math.random() * this.music_list.length);
      await this.get_music(this.random_index);
      this.inner_audio_context.src = this.music_info.src;
    },
    async upMusic() {
      if (this.random_index === 0) {
        this.random_index = this.music_list.length - 1;
      } else {
        this.random_index--;
      }
      await this.get_music(this.random_index);
      this.inner_audio_context.src = this.music_info.src;
      await this.play();

    },
    async downMusic() {
      if (this.random_index === this.music_list.length - 1) {
        this.random_index = 0;
      } else {
        this.random_index++;
      }
      await this.get_music(this.random_index);
      this.inner_audio_context.src = this.music_info.src;
      await this.play();
    },
    readLyrics(lyric) {
      const lines = lyric.split("\n")
      for(let n = 0; n < lines?.length; n++) {
        if(lines[n].slice(-1) === ']') continue;


        const re = /\[(?<timeStr>.*?)](?<words>.*)/;
        const match = re.exec(lines[n]);
        if (match) {
          const lyric = match.groups;
          const timeStr = lyric.timeStr;
          const words = lyric.words;
          const timeArr = timeStr.split(":");
          const time = parseInt(timeArr[0]) * 60 + parseFloat(timeArr[1]);
          this.lyric_list.push({time, words});
        }
      }
    },
    createLyricElements() {
      let frag = document.createDocumentFragment();
      for(let i = 0; i < this.lyric_list.length; i++){
        const p = document.createElement('p');
        p.textContent = this.lyric_list[i].words;
        p.style.color = '#FFFFFF';
        p.style.lineHeight ="6vh";
        p.style.fontSize = '3vh';
        p.style.fontFamily = "SYST";
        p.style.textShadow = "black 0.1em 0.1em 0.2em"
        frag.appendChild(p);
      }
      const lyric = document.getElementById('lyric');
      lyric.appendChild(frag);
    },
    deleteLyricElements() {
      this.lyric_list = [];
      document.getElementById('lyric').querySelectorAll('p').forEach((p) => {
        p.remove();
      });
    },
    findIndex(){
      if(this.inner_audio_context.currentTime >= this.lyric_list[this.lyric_list.length - 1].time) {
        return this.lyric_list.length - 1;//没找到则显示最后一句歌词
      }
      for(let i = 0; i < this.lyric_list.length; i++){
        if(this.inner_audio_context.currentTime <= this.lyric_list[i].time) {
          return i - 1;
        }
      }
    },
    setOffset(){
      const index = this.findIndex();
      let h = 6 * index;//p的高度乘以下标 + 一半的p的高度 - 容器高度的一半
      const lyric = document.getElementById('lyric');
      lyric.style.transform = `translateY(-${h}vh)`;
    }
  }
}
</script>

<template>
    <div :class="{'left-0':display_state,'left-[-42vh]':!display_state}"
       class=" transition-all duration-500 fixed bottom-[40px] left-0 w-[44vh] h-[12vh] bg-white z-[1000] flex flex-row items-center justify-between shadow-md">
      <div class="ml-[2vh]">
        <div class="w-[38vh] flex flex-row justify-between items-center">
          <div class="flex flex-row">
            <div class="mt-[1vh]">
              <el-avatar :src="music_info.cover"
                       style="width: 5.6vh;height:5.6vh"></el-avatar>
            </div>
            <div class="flex flex-col">
              <div class="ml-[1vh] mt-[1vh] text-[2.2vh] font-['SYST']">{{
                  truncate_text(music_info.name, 6)
                }}
              </div>
              <div class="ml-[1vh] text-[1.6vh] font-['SYST']">{{
                  truncate_text(music_info.singer, 6)
                }}
              </div>
            </div>
          </div>
          <div class="flex flex-row justify-between items-center">
            <el-icon style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px" @click="upMusic">
              <ArrowLeftBold style="width: 3vh;height:3vh"/>
            </el-icon>
            <el-icon v-if="play_state === 'pause'" style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px"
                   @click="play">
              <VideoPlay style="width: 3vh;height:3vh"/>
            </el-icon>
            <el-icon v-if="play_state === 'play'" style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px"
                   @click="pause">
              <VideoPause style="width: 3vh;height:3vh"/>
            </el-icon>
            <el-icon style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px" @click="downMusic">
              <ArrowRightBold style="width: 3vh;height:3vh"/>
            </el-icon>
          </div>
        </div>
        <div class="w-[38vh] flex flex-row">
          <div class="font-['SYST']">{{ musicTime(this.inner_audio_context.currentTime) }}</div>
          <el-slider v-model="value" :change="change()" :max="this.inner_audio_context.duration" :show-tooltip="false" size="small"
                   style="margin-left: 15px;margin-right: 15px;width: 30vh"/>
          <div class="font-['SYST']">{{ musicTime(this.inner_audio_context.duration) }}</div>
        </div>
      </div>
      <div class="w-[2vh] h-[12vh] border-l border-[#000000] flex flex-col justify-center items-center"
         @click="toggleDisplay">
        <el-icon v-if="display_state">
          <CaretLeft/>
        </el-icon>
        <el-icon v-if="!display_state">
          <CaretRight/>
        </el-icon>
      </div>
    </div>
    <div class="z-[500] fixed left-[20vw] bottom-[50px] w-[60vw] h-[6vh] overflow-y-hidden">
      <div id="lyric" class="w-full h-full flex flex-col items-center justify-start duration-700"></div>
    </div>
</template>

<style scoped>

</style>