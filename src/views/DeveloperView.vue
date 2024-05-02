<script>
export default {
  data() {
    return {
      star: [{
        name: "bilibili",
        svg: "/static/svg/哔哩哔哩.svg",
        link: "https://space.bilibili.com/25124707",
      },],
      lemon: [{
        name: "bilibili",
        svg: "/static/svg/哔哩哔哩.svg",
        link: "https://space.bilibili.com/400932209",
      },],
    };
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col px-[20px]">
    <div class="w-full h-[20%]">
    </div>
    <div class="w-full h-[20%]">
      <div class="text-[30px] font-['SYST']">
        此网站所用到的技术
      </div>
      <img alt="Vue" class="w-[10vh] h-[10vh]" src="/static/svg/Vue.svg"/>
    </div>
    <div class="w-full h-[30%] flex flex-row items-center content-center">
      <div class="w-[20%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]"
             src="/static/avatar/1.jpg"/>
        <div class="flex flex-row content-center items-center">
          <div v-for="i in star" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img :src="i.svg" :title="i.name" alt="联系方式" class="w-[4vh] h-[4vh]"/>
            </a>
          </div>
        </div>
      </div>
      <div class="w-[80%] h-full p-[20px] ">
        <div class="w-full h-full bg-[#dedede] rounded-[25px] p-[20px] text-[20px] font-['SJJS']">
          诶嘿～
        </div>
      </div>
    </div>
    <div class="w-full h-[30%] flex flex-row items-center content-center">
      <div class="w-[80%] h-full p-[20px]">
        <div class="w-full h-full bg-[#dedede] rounded-[25px] p-[20px] text-[20px] font-['SJJS']">
          嗯...不要在该努力的日子选择安逸<br/>嗯，就这样
        </div>
      </div>
      <div class="w-[20%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]"
             src="/static/avatar/2.jpg"/>
        <div class="flex flex-row content-center items-center">
          <div v-for="i in lemon" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img :src="i.svg" :title="i.name" alt="联系方式" class="w-[4vh] h-[4vh]"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>