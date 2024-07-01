<script>

import MyEditor from "../../components/MyEditor.vue";

export default {
  name: 'ArticleAdminView',
  components: {MyEditor},
  data() {
    return {
      value: '',

    }
  },
  methods: {
    releaseArticle(){
      console.log(this.value)
    },

  }
}
</script>

<template>
  <div class="h-full w-full bg-[#F8FAFD]">
    <div class="w-full h-[50px] flex flex-row items-center justify-around">
      <div class="flex flex-row">
    <p>文章标题：</p>
    <el-Input style="width: auto;height: 30px"></el-Input>
      </div>
      <div class="flex flex-row">
    <p>文章简介：</p>
    <el-Input style="width: auto;height: 30px"></el-Input>
      </div>
      <div class="flex flex-row">
        <p>文章封面：</p>
        <el-Input style="width: auto;height: 30px" placeholder="请输入一个图片链接"></el-Input>
      </div>
    <el-button type="primary" @click="releaseArticle()">发布</el-button>
    </div>
    <my-editor @update:model-value="(value) => this.value = value"></my-editor>
  </div>
</template>

<style scoped>
</style>
