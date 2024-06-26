<script>
export default {
  name: 'ArticleView',
  components: {

  },
  data() {
    return {
      articles:[
        {
          title: '文章标题',
          content: '文章内容',
          date: '2022-01-01',
          author: '作者1',
          views: '100',
          comments: '50',
          likes: '100'
        },
        {
          title: '文章标题',
          content: '文章内容',
          date: '2022-01-01',
          author: '作者2',
          views: '100',
          comments: '50',
          likes: '100'
        },
        {
          title: '文章标题',
          content: '文章内容',
          date: '2022-01-01',
          author: '作者1',
          views: '100',
          comments: '50',
          likes: '100'
        },
        {
          title: '文章标题',
          content: '文章内容',
          date: '2022-01-01',
          author: '作者2',
          views: '100',
          comments: '50',
          likes: '100'
        }
      ]
    }
  }
}
</script>

<template>
  <div class="h-full w-full bg-[#F8FAFD] flex flex-col items-center justify-start">
    <div class="w-full min-h-[60vh] bg-[url('/static/background/1.jpg')] bg-cover shadow-md">
    </div>
    <div class="w-[70%] min-h-[200vh] bg-[#FFFFFF] shadow-md mt-[20px]">
      <div v-for="article in articles">
        <div class="w-full h-[100px]">
          <div class="text-[3vh] font-['SYST']">{{ article.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>