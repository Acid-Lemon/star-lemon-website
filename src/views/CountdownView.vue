<script>

export default {
  name: "CountdownView",
  data() {
    return {
      time: 1743706098000,
      time_str: "",
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      this.Countdown();
    }, 1000)
  },
  onUnload() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  methods: {
    Countdown() {
      // 计算距离“star和lemon的小站”建站一周年纪念日还有多少时间
      let time = this.time - Date.now();
      let day = Math.floor(time / (1000 * 60 * 60 * 24));
      let hour = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minute = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
      let second = Math.floor((time % (1000 * 60)) / 1000);

      this.time_str = `${day}天${hour}小时${minute}分钟${second}秒`;
    }
  }
}
</script>

<template>
  <div class="bg-[url('/static/background/14.jpg')] bg-cover w-full h-full flex flex-col justify-center items-center">
    <span class="text-[#FFFFFF] font-['RGBZ'] md:text-[3vw] text-[9vw]">距离“star和lemon的小站”建站一周年纪念日</span>
    <span class="text-[#FFFFFF] font-['RGBZ'] md:text-[3vw] text-[9vw]">还有{{ time_str }}</span>
  </div>
</template>

<style scoped>
</style>