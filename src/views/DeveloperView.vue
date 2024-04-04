<script>
export default {
  data() {
    return {
      lemon: [
        {
          name: "QQ",
          svg: "/static/svg/QQ.svg",
          link: "tencent://message/?uin=3573045100&Menu=yes",
        },
        {
          name: "bilibili",
          svg: "/static/svg/哔哩哔哩.svg",
          link: "https://space.bilibili.com/400932209",
        },
      ],
      star: [
        {
          name: "QQ",
          svg: "/static/svg/QQ.svg",
          link: "tencent://message/?uin=1598624985&Menu=yes",
        },
      ],
    };
  },
};
</script>

<template>
  <div class="w-full h-[50%] flex flex-col items-start justify-center pl-[5vw]">
    <img class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]" src="/static/avatar/1.jpg" alt="头像"/>
    <div class="flex flex-row justify-center items-center">
      <div v-for="i in star" class="mx-[2vh] flex flex-row justify-center items-center">
        <a :href="i.link" target="_blank">
          <img class="w-[4vh] h-[4vh]" :title="i.name" :src="i.svg" alt="联系方式"/>
        </a>
      </div>
    </div>
  </div>
  <div class="w-full h-[50%] flex flex-col items-end justify-center pr-[5vw]">
    <img class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]" src="/static/avatar/2.jpg" alt="头像"/>
    <div class="flex flex-row justify-center items-center">
      <div v-for="i in lemon" class="mx-[2vh] flex flex-row justify-center items-center">
        <a :href="i.link" target="_blank">
          <img class="w-[4vh] h-[4vh]" :title="i.name" :src="i.svg" alt="联系方式"/>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>