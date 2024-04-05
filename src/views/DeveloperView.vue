<script>
  export default {
    data() {
      return {
        star: [{
          name: "bilibili",
          svg: "/static/svg/哔哩哔哩.svg",
          link: "https://space.bilibili.com/25124707",
        }, ],
        lemon: [{
          name: "bilibili",
          svg: "/static/svg/哔哩哔哩.svg",
          link: "https://space.bilibili.com/400932209",
        }, ],
      };
    },
  };
</script>

<template>
  <div class="w-full h-full flex flex-col px-[20px]">
    <div class="w-full h-[20%]">
    </div>
    <div class="w-full h-[40%] flex flex-row items-center content-center">
      <div class="w-[20%] h-full flex flex-col justify-center items-center">
        <img class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]"
          src="/static/avatar/1.jpg" alt="头像" />
        <div class="flex flex-row content-center items-center">
          <div v-for="i in star" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img class="w-[4vh] h-[4vh]" :title="i.name" :src="i.svg" alt="联系方式" />
            </a>
          </div>
        </div>
      </div>
      <div class="w-[80%] h-full p-[20px] ">
        <div class="w-full h-full bg-[#dedede] rounded-[25px] p-[20px] text-[50px] font-['SJJS']">
          star：诶嘿～
        </div>
      </div>
    </div>
    <div class="w-full h-[40%] flex flex-row items-center content-center">
      <div class="w-[80%] h-full p-[20px]">
        <div class="w-full h-full bg-[#dedede] rounded-[25px]">
        </div>
      </div>
      <div class="w-[20%] h-full flex flex-col justify-center items-center">
        <img class="w-[15vh] h-[15vh] rounded-full hover:rotate-[360deg] duration-700 border border-[#dedede] m-[20px]"
          src="/static/avatar/2.jpg" alt="头像" />
        <div class="flex flex-row content-center items-center">
          <div v-for="i in lemon" class="mx-[2vh] flex flex-row content-center items-center">
            <a :href="i.link" target="_blank">
              <img class="w-[4vh] h-[4vh]" :title="i.name" :src="i.svg" alt="联系方式" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>