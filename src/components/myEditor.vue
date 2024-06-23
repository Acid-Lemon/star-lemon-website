<script>
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style

export default {

  mounted() {
    // 初始化编辑器
    const editor = new Editor({
      el: document.querySelector('#editor')
    });
  },
}
</script>

<template>
  <div class="h-full w-full flex flex-col items-center">
    <div id="editor" class="w-full h-full"></div>
  </div>
</template>