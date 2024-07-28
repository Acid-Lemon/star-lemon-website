<script>
export default {
  data() {
    return {
      star: {
        name: "star",
        contact: [{
          name: "bilibili",
          svg: "/static/svg/哔哩哔哩.svg",
          link: "https://space.bilibili.com/25124707",
        }],
        say: "诶嘿～"
      },
      lemon: {
        name: "lemon",
        contact: [{
          name: "bilibili",
          svg: "/static/svg/哔哩哔哩.svg",
          link: "https://space.bilibili.com/400932209",
        }],
        say: "大家好！我是lemon，一位普普通通的少年。喜欢编程，喜欢摄影，喜欢音乐，喜欢记录生活。嗯...好吧，结果每一件事都做得不是很好。"
      },
      power: [
        {
          name: "html",
          svg: "/static/svg/html.svg",
        }, {
          name: "css",
          svg: "/static/svg/css.svg",
        }, {
          name: "javascript",
          svg: "/static/svg/javascript.svg",
        }, {
          name: "Vue",
          svg: "/static/svg/Vue.svg",
        }, {
          name: "element-UI",
          svg: "/static/svg/element-UI.svg",
        }, {
          name: "tailwind-css",
          svg: "/static/svg/tailwind-css.svg",
        }, {
          name: "pinia",
          svg: "/static/svg/pinia.svg",
        }
      ]
    };
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col px-[20px] bg-[#F8FAFD]">
    <div class="w-full h-[10%]">
    </div>
    <div class="w-full h-[20%]">
      <div class="text-[30px] font-['RGBZ'] my-[20px]">
        此网站主要所用到的技术
      </div>
      <div class="flex flex-row my-[20px]">
        <div v-for="i in power" class="flex flex-row">
          <img :alt="i.name" :src="i.svg" class="w-[8vh] h-[8vh] m-[5px]"/>
          <img alt="加号" class="w-[8vh] h-[8vh] m-[5px]" src="/static/svg/加号.svg"/>
        </div>
        <img alt="省略号" class="w-[8vh] h-[8vh] m-[5px]" src="/static/svg/省略号.svg"/>
      </div>
    </div>
    <div class="w-full h-[35%] flex flex-row items-center content-center">
      <div class="w-[15%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede]"
             src="/static/developer/1.jpg"/>
        <div class="text-[20px] font-['SYST']">{{ star.name }}</div>
        <div class="flex flex-row content-center items-center">
          <div v-for="i in star.contact" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img :src="i.svg" :title="i.name" alt="联系方式" class="w-[4vh] h-[4vh]"/>
            </a>
          </div>
        </div>
      </div>
      <div class="w-[85%] h-full p-[20px]">
        <div
            class="w-full h-full bg-[#FFFFFF] rounded-[25px] p-[20px] text-[20px] font-['FZSX'] border border-[#dedede] shadow-md">
          {{ star.say }}
        </div>
      </div>
    </div>
    <div class="w-full h-[35%] flex flex-row items-center content-center">
      <div class="w-[85%] h-full p-[20px]">
        <div
            class="w-full h-full bg-[#FFFFFF] rounded-[25px] p-[20px] text-[20px] font-['FZSX'] border border-[#dedede] shadow-md">
          {{ lemon.say }}
        </div>
      </div>
      <div class="w-[15%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede]"
             src="/static/developer/2.jpg"/>
        <div class="text-[20px] font-['SYST']">{{ lemon.name }}</div>
        <div class="flex flex-row content-center items-center">
          <div v-for="i in lemon.contact" class="mx-[2vh] flex flex-row content-center items-center">
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