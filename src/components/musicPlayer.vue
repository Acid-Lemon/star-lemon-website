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

export default {
  name: 'MusicPlayer',
  components: {CaretRight, CaretLeft, DCaret, DocumentDelete, VideoPause, VideoPlay, ArrowRightBold, ArrowLeftBold},
  data() {
    return {
      value: 0,
      innerAudioContext: null,
      playState: 'pause',
      duration: 0,
      currentTime: 0,
      randomIndex: 0,
      displayState: false,
      musicList: [
        {
          name: 'The Chainsmokers',
          singer: 'Young',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/Young - The Chainsmokers.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/Young - The Chainsmokers.jpg'
        },
        {
          name: '去明天',
          singer: '周深',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/去明天 - 周深.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/去明天 - 周深.jpg'
        },
        {
          name: '第一次遇见花香的那刻',
          singer: '7paste',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/第一次遇见花香的那刻 - 7paste.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/第一次遇见花香的那刻 - 7paste.jpg'
        },
        {
          name: '你可以',
          singer: 'coco这个李文',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/你可以 - coco这个李文.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/你可以 - coco这个李文.jpg'
        },
        {
          name: 'A Thousand Years',
          singer: 'Jada Facer、Kyson Facer',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/A Thousand Years - Jada Facer、Kyson Facer.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/A Thousand Years - Jada Facer、Kyson Facer.jpg'
        },
        {
          name: '从没去过巴塞隆纳',
          singer: '告五人',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/从没去过巴塞隆纳 - 告五人.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/从没去过巴塞隆纳 - 告五人.jpg'
        },
        {
          name: '风，信箱，阳光与你',
          singer: 'RGR Y于新垚',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/风，信箱，阳光与你 - RGR Y于新垚.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/风，信箱，阳光与你 - RGR Y于新垚.jpg'
        },
        {
          name: '流萤之森',
          singer: 'Namibia',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/流萤之森 - Namibia.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/流萤之森 - Namibia.jpg'
        },
        {
          name: '烟雨小镇',
          singer: '陈阿晓',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/烟雨小镇 - 陈阿晓.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/烟雨小镇 - 陈阿晓.jpg'
        },
        {
          name: '有光',
          singer: '买辣椒也用券',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/有光 - 买辣椒也用券.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/有光 - 买辣椒也用券.jpg'
        },
        {
          name: '在日落前出发',
          singer: '江迟同学',
          src: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/musics/在日落前出发 - 江迟同学.mp3',
          cover: 'https://mp-9c25a9c3-8b6e-4390-be64-8d3056531359.cdn.bspapp.com/pictures/在日落前出发 - 江迟同学.jpg'
        }
      ]
    }
  },
  mounted() {
    this.innerAudioContext = uni.createInnerAudioContext();
    this.switchMusic();
    this.innerAudioContext.onCanplay(() => {
      this.duration = this.innerAudioContext.duration
    })
    this.innerAudioContext.onPlay(() => {
      this.playState = 'play';
      this.innerAudioContext.onTimeUpdate(() => {
        this.currentTime = this.innerAudioContext.currentTime;
        this.value = this.currentTime;
      });
    });
    this.innerAudioContext.onPause(() => {
      this.playState = 'pause'
    });
    this.innerAudioContext.onEnded(() => {
      this.switchMusic();
      this.play();
    });
    this.innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  },
  onUnload() {
  },
  computed: {
    playerStyle() {
      return {
        left: this.displayState ? '0' : '-42vh',
        transition: 'left 0.5s ease'
      }
    }

  },
  watch: {},
  methods: {
    play() {
      this.innerAudioContext.play();
      this.playState = 'play'
    },
    pause() {
      this.innerAudioContext.pause();
      this.playState = 'pause'
    },
    musicTime(duration) {
      let f = Math.floor(duration / 60)
      if (f.toString().length === 1) {
        f = '0' + f;
      }
      let m = Math.round(duration % 60)
      if (m.toString().length === 1) {
        m = '0' + m;
      }
      return `${f}:${m}`
    },
    change() {
      if (this.value - this.currentTime > 5 || this.value - this.currentTime < -5) {
        this.innerAudioContext.seek(this.value)
      }
    },
    toggleDisplay() {
      this.displayState = !this.displayState;
    },
    switchMusic() {
      this.randomIndex = Math.floor(Math.random() * this.musicList.length);
      this.innerAudioContext.src = this.musicList[this.randomIndex].src;
    },
    upMusic() {
      if (this.randomIndex === 0) {
        this.randomIndex = this.musicList.length - 1;
      } else {
        this.randomIndex--;
      }
      this.innerAudioContext.src = this.musicList[this.randomIndex].src;
      this.play();
    },
    downMusic() {
      if (this.randomIndex === this.musicList.length - 1) {
        this.randomIndex = 0;
      } else {
        this.randomIndex++;
      }
      this.innerAudioContext.src = this.musicList[this.randomIndex].src;
      this.play();
    },
    truncateText(text, maxChineseLength) {
      let currentLength = 0;
      let truncatedText = '';

      for (let char of text) {
        // 检查字符是否为中文字符（通过字符的Unicode范围）
        if (char.match(/[\u4e00-\u9fff]/)) {
          currentLength += 2; // 中文字符长度加2
        } else {
          currentLength += 1; // 英文字符长度加1
        }

        if (currentLength <= maxChineseLength * 2) {
          truncatedText += char;
        } else {
          truncatedText += '...';
          break;
        }
      }

      return truncatedText;
    }
  }
}
</script>

<template>
  <div :style="playerStyle"
       class="fixed bottom-[40px] left-0 w-[44vh] h-[12vh] bg-white z-[1000] flex flex-row items-center justify-between shadow-md">
    <div class="ml-[2vh]">
      <div class="w-[38vh] flex flex-row justify-between items-center">
        <div class="flex flex-row">
          <div class="mt-[1vh]">
            <el-avatar :src="musicList[this.randomIndex].cover"
                       style="width: 5.6vh;height:5.6vh"></el-avatar>
          </div>
          <div class="flex flex-col">
            <div class="ml-[1vh] mt-[1vh] text-[2.2vh] font-['SYST']">{{
                truncateText(musicList[this.randomIndex].name, 6)
              }}
            </div>
            <div class="ml-[1vh] text-[1.6vh] font-['SYST']">{{
                truncateText(musicList[this.randomIndex].singer, 6)
              }}
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-between items-center">
          <el-icon style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px" @click="upMusic">
            <ArrowLeftBold style="width: 3vh;height:3vh"/>
          </el-icon>
          <el-icon v-if="playState === 'pause'" style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px"
                   @click="play">
            <VideoPlay style="width: 3vh;height:3vh"/>
          </el-icon>
          <el-icon v-if="playState === 'play'" style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px"
                   @click="pause">
            <VideoPause style="width: 3vh;height:3vh"/>
          </el-icon>
          <el-icon style="width: 3vh;height:3vh;margin-left: 5px;margin-right: 5px" @click="downMusic">
            <ArrowRightBold style="width: 3vh;height:3vh"/>
          </el-icon>
        </div>
      </div>
      <div class="w-[38vh] flex flex-row">
        <div class="font-['SYST']">{{ musicTime(this.currentTime) }}</div>
        <el-slider v-model="value" :change="change()" :max="duration" :show-tooltip="false" size="small"
                   style="margin-left: 15px;margin-right: 15px;width: 30vh"/>
        <div class="font-['SYST']">{{ musicTime(this.duration) }}</div>
      </div>
    </div>
    <div class="w-[2vh] h-[12vh] border-l border-[#000000] flex flex-col justify-center items-center"
         @click="toggleDisplay">
      <el-icon v-if="displayState">
        <CaretLeft/>
      </el-icon>
      <el-icon v-if="!displayState">
        <CaretRight/>
      </el-icon>
    </div>
  </div>

</template>

<style scoped>

</style>