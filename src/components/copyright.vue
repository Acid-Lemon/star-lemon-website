<script>

export default {
    name: "Copyright",
  data(){
      return {
        time:1712170098000,
        time_str:"",
      }
  },
  computed:{

  },
  watch:{

  },
  created(){

  },
  mounted() {
    this.timer = setInterval(() => {
      this.Counting();
    }, 1000)
  },
  onUnload() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  components:{

  },
  props:{

  },
  methods:{
    Counting() {
      // 计算“star和lemon的小站”运行时间
      let time = Date.now() - this.time;
      let day = Math.floor(time / (1000 * 60 * 60 * 24));
      let hour = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minute = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
      let second = Math.floor((time % (1000 * 60)) / 1000);

      this.time_str = `${day}天${hour}小时${minute}分${second}秒`;
    }

  },

};

</script>

<template>
  <div class="fixed bottom-[8px] left-[10px] z-50 flex md:flex-row flex-col">
      <div class="text-[#222222] md:text-[15px] text-[12px] md:mr-[10px] mr-0 font-['SYST']">Copyright © 2023-{{ new Date().getFullYear() }} star和lemon的小站 All Rights Reserved.</div>
      <a href="https://beian.miit.gov.cn/" class="text-[#dd5a00] md:text-[15px] text-[12px] md:mr-[10px] mr-0  font-['SYST']" target="_blank">皖ICP备2024036960号-1</a>
      <div class="text-[#222222] md:text-[15px] text-[12px] font-['SYST']">网站在各种灾难中运行了:{{time_str}}</div>
  </div>
</template>

<style>
</style>
