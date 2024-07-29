<script>
import {ArrowLeft, CaretTop} from "@element-plus/icons-vue";

export default {
  name: 'NoteView',
  components: {CaretTop, ArrowLeft},
  data() {
    return{
      article: {
        title: '电脑新手必须要注意的事项',
        content: '1.下载软件\n' +
            '下载软件一定要去软件的官网，不要去xx软件园或xx下载站下载软件。\n' +
            '\n' +
            '因为非官方渠道下载的软件往往都是捆绑软件或流氓软件。\n' +
            '\n' +
            '它们会篡改你的浏览器主页，自动后台静默安装应用。\n' +
            '\n' +
            '所以怎么区分哪个是官网呢？看域名和标题。\n' +
            '\n' +
            '一般官网的域名开头为软件的英文名，后面跟上.com或者.cn，且标题简洁直观。\n' +
            '\n' +
            '下面以搜索QQ为例\n' +
            '\n' +
            '\n' +
            '第一条搜索结果\n' +
            '根据域名来看，确实是腾讯的官方网站，但是看一下标题，这个其实是腾讯新闻，看下一条。\n' +
            '\n' +
            '\n' +
            '第二条搜索结果\n' +
            '根据域名和标题，可以看出这就是QQ的官网。\n' +
            '\n' +
            '\n' +
            '第三条搜索结果\n' +
            '这个根据域名来看，这是腾讯电脑管家的安装渠道，标题很长，很明显不是官网。\n' +
            '\n' +
            '\n' +
            '第四条搜索结果\n' +
            '这个不用讲了吧，域名和标题都摆明了这是QQ邮箱的官网\n' +
            '\n' +
            '\n' +
            '第五条搜索结果\n' +
            '这个域名是yesky，一看就是xx下载站，千万不要下载。\n' +
            '\n' +
            '2.不要安装安全软件\n' +
            '安全软件其实是没必要安装的，有些安全软件其实更流氓。\n' +
            '\n' +
            'windows有自带的安全软件，而且电脑一般也不会中病毒。\n' +
            '\n' +
            '就像你手机一样的，你手机安装杀毒软件吗？应该没有吧。\n' +
            '\n' +
            '而且这些软件反而会拖慢你的开机速度，占用你的电脑性能。\n' +
            '\n' +
            '有些人会这么说：不安装这些软件我怎么清理垃圾啊，怎么安装软件啊，怎么卸载软件啊？\n' +
            '\n' +
            '下面给大家讲一下这个问题。\n' +
            '\n' +
            '清理垃圾：\n' +
            '电脑的磁盘空间一般都很大，不需要清理，一般也没什么垃圾，顶多有一点卸载残留，这个在后面的卸载软件会提到。\n' +
            '\n' +
            '安装软件：\n' +
            '在官网下载即可。\n' +
            '\n' +
            '卸载软件：\n' +
            'windows设置里的应用与功能可以卸载，不过我不建议这么卸载，较为麻烦，也还是可能存在残留残留。建议使用一个小软件：Geek Uninstaller。这个软件是免费的，可以自行在浏览器中搜索下载。这个软件卸载完成的时候会自动检测卸载残留，非常的好用。\n' +
            '\n' +
            '如果讲了这么多，你还是非要用安全软件（比如需要某些特殊的小功能，比如文件粉碎，网络修复或弹窗拦截等），那样的话，我建议使用火绒，非常的简洁纯净且功能齐全。\n' +
            '\n' +
            '3.不要随意删除系统盘符的文件\n' +
            '一般电脑的系统盘符为C盘，里面有着系统文件，非常的重要，删除后可能导致电脑系统崩溃，所以在不了解的情况下不要轻易乱动。\n' +
            '\n' +
            '4.不要把软件都安装到系统盘符\n' +
            '系统盘符内安装的软件过多的话，C盘剩余空间太小，会影响系统的运行速度。\n' +
            '\n' +
            '但如果你的电脑只装有一块磁盘，可以忽略这点。\n' +
            '\n' +
            '5.不要相信网上说什么改个设置大大提升性能或者网速\n' +
            '都是骗你的，其实一点用也没有。',
        date: '2022年08月09日星期五',
        author: 'lemon',
        views: '100',
        comments: '50',
        likes: '100'
      },
      scrollPercentage: 0,
    }
  },
  methods: {
    handleScroll(distance) {
      const scrollHeight =this.$refs["el-scrollbar"].wrapRef.scrollHeight - this.$refs["el-scrollbar"].wrapRef.offsetHeight;
      this.scrollPercentage = Math.round((distance.scrollTop / scrollHeight) * 100);
    },
    backTop() {
      this.$refs["el-scrollbar"].wrapRef.scrollTop = 0;
    },
    onBack() {
      if(window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/article');
      }
    }
  },
}
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-[6vh] p-[10px] z-[1000] flex flex-row items-center">
    <div @click="onBack" class="flex flex-row items-center text-[#FFFFFF] font-['RGBZ']">
      <el-icon style="width: 25px; height: 25px"><arrow-left style="width: 25px; height: 25px" /></el-icon>
      返回
    </div>
    <div class="w-[1px] h-[80%] border border-[#FFFFFF] mx-[10px]"></div>
    <div class="text-[2vh] text-[#FFFFFF] font-['RGBZ']">文章</div>
  </div>
  <el-scrollbar @scroll="handleScroll" ref="el-scrollbar">
  <div class="h-full w-full flex flex-col items-center justify-start">
    <div class="w-full min-h-[40vh] bg-[url('/static/background/23.jpg')] flex flex-col justify-center items-center bg-center bg-cover">
      <p class="text-[#FFFFFF] font-['FZSX'] text-[4vh] hover:text-[#44cef6] duration-700">
        {{ article.title }}
      </p>
      <div class="flex flex-row items-center mb-[5px]">
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px]">{{ article.author }}</div>
        <svg class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5Z"></path>
        </svg>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.date }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/views.svg" alt="浏览"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.views }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/likes.svg" alt="喜欢"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.likes }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/comments.svg" alt="评论"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] opacity-50">{{ article.comments }}</div>
      </div>
    </div>
    <div class="w-full flex flex-row items-start justify-center bg-[#F8FAFD]">
      <div class="w-[15%] flex flex-col items-center justify-start"></div>
      <div class="w-[70%] flex flex-col items-center justify-start">
        <div class="w-full bg-[#FFFFFF] shadow-md mt-[20px] text-[2vh] font-['SYST'] p-[40px] whitespace-pre-line">
        {{ article.content }}
        </div>
      </div>
      <div class="w-[15%] flex flex-col items-start justify-start">
        <el-affix :offset="5">
          <div class="p-[20px]">
            <div class="text-[1.8vh] my-[5px] font-['FZSX']">这是一个二级标题展示区域</div>
            <div class="text-[1.5vh] my-[5px] font-['FZSX']">二级标题1</div>
            <div class="text-[1.5vh] my-[5px] font-['FZSX']">二级标题2</div>
            <div class="text-[1.5vh] my-[5px] font-['FZSX']">二级标题3</div>
            <el-divider />
            <div class="flex flex-row items-center justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.5vh" height="1.5vh" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15q-1.363-1.362-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175Q6.3 3.575 8.124 2.788T12 2q.425 0 .713.288T13 3q0 .425-.288.713T12 4Q8.675 4 6.337 6.338T4 12q0 3.325 2.338 5.663T12 20q3.325 0 5.663-2.337T20 12q0-.425.288-.712T21 11q.425 0 .713.288T22 12q0 2.05-.788 3.875t-2.15 3.188q-1.362 1.362-3.175 2.15T12 22"></path>
              </svg>
              <div class="m-[3px] text-[1.5vh] font-['SYST']">{{ scrollPercentage }}%</div>
            </div>
          </div>
        </el-affix>
      </div>
    </div>
  </div>
  </el-scrollbar>
  <div v-if="scrollPercentage > 20" @click="backTop" class="fixed bottom-[40px] right-[40px] w-[40px] h-[40px] border-[2px] border-[#000000] rounded-full flex flex-row justify-center items-center">
    <el-icon style="width: 20px; height: 20px"><CaretTop style="width: 20px; height: 20px" /></el-icon>
  </div>
</template>

<style scoped>

</style>