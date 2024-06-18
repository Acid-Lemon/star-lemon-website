<script>

</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto w-full h-full">
      <div v-for="image in images" :key="image" class="w-full shadow-md">
        <div>
          <el-image class="w-full h-full" :src="image.imgUrl" fit="cover"/>
          <span>{{ image.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>