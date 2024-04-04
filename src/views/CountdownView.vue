<script>
  export default {
    data() {
      return {
        time: 1717689600000,
        day: null,
        hour: null,
        minute: null,
        second: null,
        timer: null
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
        const now = new Date();
        let countdown = this.time - now;
        this.day = Math.floor(countdown / (1000 * 60 * 60 * 24));
        this.hour = Math.floor((countdown - this.day * 1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        this.minute = Math.floor((countdown - this.day * 1000 * 60 * 60 * 24 - this.hour * 1000 * 60 * 60) / (1000 *
          60));
        this.second = Math.floor((countdown - this.day * 1000 * 60 * 60 * 24 - this.hour * 1000 * 60 * 60 - this
          .minute * 1000 * 60) / 1000);
      }
    }
  }
</script>

<template>
    <div class="bg-[url('/static/background/14.jpg')] bg-cover w-full h-full flex flex-row justify-center items-center">
      <span class="text-[#FFFFFF] font-['RGBZ'] md:text-[3vw] text-[9vw] mx-[40px]">距离2024年高考还有{{day}}天{{hour}}时{{minute}}分{{second}}秒</span>
    </div>
</template>

<style scoped>
</style>