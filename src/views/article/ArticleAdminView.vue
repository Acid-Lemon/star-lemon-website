<script>

import MyEditor from "../../components/myEditor.vue";

export default {
  name: 'ArticleAdminView',
  components: {MyEditor},
  data() {
    return {

    }
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
    <el-button type="primary">发布</el-button>
    </div>
    <myEditor></myEditor>
  </div>
</template>

<style scoped>
</style>
