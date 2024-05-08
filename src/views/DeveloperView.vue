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
        say: "二十多岁的年纪，有人继续就学，有人考公考编，恋爱结婚。大家穿着不同的鞋子，注定要走不同的路。好像二十几岁的生活被按了加速键，我的身边充斥着各种声音，你该如何如何，于是内心一直不坚定，生怕赶不上别人。二十几岁是兵荒马乱的年纪，想要得太多，就会乱了阵脚。有时候摧毁一些东西，毫不费力，我时常问自己，到底想要成为什么样的人。人生是旷野，而非既定轨道。一生的时间太漫长，让树成树，让花成花。允许一切如其所是，大家都在各自的时区里，没有快慢。所以我应该不用追赶，不用慌乱害怕。好好感受当下，做好当下的事才是最重要的。小时候不懂事，总觉得一个人太孤单。后来一个人走了很远的路，时常感叹人生无常，不停后悔说过的话，做过的事，很难往前走，我不在期待谁能与我在一起，度过我人生中的每一分钟。事事难料，随遇而安，珍惜当下。改天是哪天，下次是哪次。以后是多远，山高路远，独善其身，看世界，也找自己。欲买桂花同载酒，终不似少年游。"
      },
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
      <img alt="Vue" class="w-[8vh] h-[8vh] m-[5px]" src="/static/svg/Vue.svg"/>
    </div>
    <div class="w-full h-[30%] flex flex-row items-center content-center">
      <div class="w-[15%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede]"
             src="/static/avatar/1.jpg"/>
        <div class="text-[20px] font-['SYST']">{{ star.name }}</div>
        <div class="flex flex-row content-center items-center">
          <div v-for="i in star.contact" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img :src="i.svg" :title="i.name" alt="联系方式" class="w-[4vh] h-[4vh]"/>
            </a>
          </div>
        </div>
      </div>
      <div class="w-[85%] h-full p-[20px] ">
        <div class="w-full h-full bg-[#dedede] rounded-[25px] p-[20px] text-[20px] font-['SJJS']">
          {{ star.say }}
        </div>
      </div>
    </div>
    <div class="w-full h-[30%] flex flex-row items-center content-center">
      <div class="w-[85%] h-full p-[20px]">
        <div class="w-full h-full bg-[#dedede] rounded-[25px] p-[20px] text-[20px] font-['SJJS']">
          {{ lemon.say }}
        </div>
      </div>
      <div class="w-[15%] h-full flex flex-col justify-center items-center">
        <img alt="头像"
             class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede]"
             src="/static/avatar/2.jpg"/>
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