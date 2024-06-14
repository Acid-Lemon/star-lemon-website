<script>

export default {
  data() {
    return {
      images: [],
    }
  },
  mounted() {

  },
  methods: {
    // 获取上传状态
    select(e) {
      console.log('选择文件：', e)
    },
    // 获取上传进度
    progress(e) {
      console.log('上传进度：', e)
    },

    // 上传成功
    success(e) {
      console.log('上传成功')
    },

    // 上传失败
    fail(e) {
      console.log('上传失败：', e)
    },
  }
};
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD]">
    <uni-file-picker fileMediatype="image" mode="grid"
                     @fail="fail"
                     @progress="progress"
                     @select="select" @success="success"/>
  </div>
</template>

<style scoped>

</style>
