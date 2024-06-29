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
import {truncateText} from "@/src/utils/truncate_text";

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
      lyricList: [],
      displayState: false,
      musicList: [
        {
          name: 'Young',
          singer: 'The Chainsmokers',
          src: '/static/music/Young - The Chainsmokers.mp3',
          cover: '/static/cover/Young - The Chainsmokers.jpg',
          lrc: '/static/lrc/Young - The Chainsmokers.lrc'
        },
        {
          name: '去明天',
          singer: '周深',
          src: '/static/music/去明天 - 周深.mp3',
          cover: '/static/cover/去明天 - 周深.jpg',
          lrc: '/static/lrc/去明天 - 周深.lrc'
        },
        {
          name: '第一次遇见花香的那刻',
          singer: '7paste',
          src: '/static/music/第一次遇见花香的那刻 - 7paste.mp3',
          cover: '/static/cover/第一次遇见花香的那刻 - 7paste.jpg',
          lrc: '/static/lrc/第一次遇见花香的那刻 - 7paste.lrc'
        },
        {
          name: '你可以',
          singer: 'coco这个李文',
          src: '/static/music/你可以 - coco这个李文.mp3',
          cover: '/static/cover/你可以 - coco这个李文.jpg',
          lrc: '/static/lrc/你可以 - coco这个李文.lrc'
        },
        {
          name: 'A Thousand Years',
          singer: 'Jada Facer、Kyson Facer',
          src: '/static/music/A Thousand Years - Jada Facer、Kyson Facer.mp3',
          cover: '/static/cover/A Thousand Years - Jada Facer、Kyson Facer.jpg',
          lrc: '/static/lrc/A Thousand Years - Jada Facer、Kyson Facer.lrc'
        },
        {
          name: '从没去过巴塞隆纳',
          singer: '告五人',
          src: '/static/music/从没去过巴塞隆纳 - 告五人.mp3',
          cover: '/static/cover/从没去过巴塞隆纳 - 告五人.jpg',
          lrc: '/static/lrc/从没去过巴塞隆纳 - 告五人.lrc'
        },
        {
          name: '风，信箱，阳光与你',
          singer: 'RGR Y于新垚',
          src: '/static/music/风，信箱，阳光与你 - RGR Y于新垚.mp3',
          cover: '/static/cover/风，信箱，阳光与你 - RGR Y于新垚.jpg',
          lrc: '/static/lrc/风，信箱，阳光与你 - RGR Y于新垚.lrc'
        },
        {
          name: '流萤之森',
          singer: 'Namibia',
          src: '/static/music/流萤之森 - Namibia.mp3',
          cover: '/static/cover/流萤之森 - Namibia.jpg',
          lrc: '/static/lrc/流萤之森 - Namibia.lrc'
        },
        {
          name: '烟雨小镇',
          singer: '陈阿晓',
          src: '/static/music/烟雨小镇 - 陈阿晓.mp3',
          cover: '/static/cover/烟雨小镇 - 陈阿晓.jpg',
          lrc: '/static/lrc/烟雨小镇 - 陈阿晓.lrc'
        },
        {
          name: '有光',
          singer: '买辣椒也用券',
          src: '/static/music/有光 - 买辣椒也用券.mp3',
          cover: '/static/cover/有光 - 买辣椒也用券.jpg',
          lrc: '/static/lrc/有光 - 买辣椒也用券.lrc'
        },
        {
          name: '在日落前出发',
          singer: '江迟同学',
          src: '/static/music/在日落前出发 - 江迟同学.mp3',
          cover: '/static/cover/在日落前出发 - 江迟同学.jpg',
          lrc: '/static/lrc/在日落前出发 - 江迟同学.lrc'
        }
      ]
    }
  },
  mounted() {
    this.innerAudioContext = uni.createInnerAudioContext();
    this.innerAudioContext.volume = 0.1;
    this.switchMusic();
    this.innerAudioContext.onCanplay(() => {
      this.duration = this.innerAudioContext.duration;

    })
    this.innerAudioContext.onPlay(() => {
      this.playState = 'play';
      this.innerAudioContext.onTimeUpdate(() => {
        this.currentTime = this.innerAudioContext.currentTime;
        this.value = this.currentTime;
        this.setOffset()
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


  },
  watch: {},
  methods: {
    truncateText,
    async play() {
      this.innerAudioContext.play();
      this.deleteLyricElements();
      await this.readLyrics(this.musicList[this.randomIndex].lrc);
      this.createLyricElements();
      console.log(document.getElementById('lyric').querySelectorAll('p'));
    },
    pause() {
      this.innerAudioContext.pause();
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
    readLyrics(filePath) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: filePath,
          success: (res) => {
            if (res.statusCode === 200) {
              const lines = res.data.split("\n")
              for(let n = 0; n < lines?.length; n++){
                const re = /\[(?<timeStr>.*?)](?<words>.*)/;
                const match = re.exec(lines[n]);
                if(match){
                  const lyric = match.groups;
                  const timeStr = lyric.timeStr;
                  const words = lyric.words;
                  const timeArr = timeStr.split(":");
                  const time = parseInt(timeArr[0]) * 60 + parseFloat(timeArr[1]);
                  this.lyricList.push({time, words});
                }
              }
              resolve();
            } else {
              console.error('读取文件失败，状态码：', res.statusCode);
              reject({statusCode: res.statusCode});
            }
          },
          fail: (err) => {
            console.error('读取文件失败：', err);
            reject(err);
          }
        })
      });
    },
    createLyricElements() {
      let frag = document.createDocumentFragment();
      for(let i = 0; i < this.lyricList.length; i++){
        const p = document.createElement('p');
        p.textContent = this.lyricList[i].words;
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
      this.lyricList = [];
      document.getElementById('lyric').querySelectorAll('p').forEach((p) => {
        p.remove();
      });
    },
    findIndex(){
      if(this.currentTime >= this.lyricList[this.lyricList.length - 1].time) {
        return this.lyricList.length - 1;//没找到则显示最后一句歌词
      }
      for(let i = 0; i < this.lyricList.length; i++){
        if(this.currentTime <= this.lyricList[i].time) {
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
    <div :class="{'left-0':displayState,'left-[-42vh]':!displayState}"
       class=" transition-all duration-500 fixed bottom-[40px] left-0 w-[44vh] h-[12vh] bg-white z-[1000] flex flex-row items-center justify-between shadow-md">
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
    <div class="z-[500] fixed left-[20vw] bottom-[50px] w-[60vw] h-[6vh] overflow-y-hidden">
      <div id="lyric" class="w-full h-full flex flex-col items-center justify-start duration-700"></div>
    </div>
</template>

<style scoped>

</style>