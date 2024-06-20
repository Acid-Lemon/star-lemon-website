<script>
import {ElMessageBox} from "element-plus";
import SideNavigationBar from "@/src/components/SideNavigationBar.vue";

export default {
  components: {SideNavigationBar},
  data() {
    return {
      WebName: "star和lemon的小站",
      newWebName: "star和lemon的小站",
      username: "lemon",
      dialogVisible: false,
      timeState: "",
    };
  },
  mounted() {
    let time = new Date().getHours()
  },
  methods: {
    handleClose(done) {
      ElMessageBox.confirm('你确定关闭吗?（信息将不会被保存）')
          .then(() => {
            done()
          })
          .catch(() => {
            // catch error
          })
    }
  }
};
</script>

<template>
  <div class="w-full h-full">
    <el-card class="w-[480px] ml-[20px] mt-[20px]">
      <template #header>
        <div class="card-header">
          <span>网站信息</span>
        </div>
      </template>
      <span @click="dialogVisible = true">网站名称：{{ WebName }}</span>
      <template #footer>{{ username }}上午好！</template>
    </el-card>
    <el-dialog
        v-model="dialogVisible"
        :before-close="handleClose"
        title="修改信息"
        width="500"
    >
      <el-input v-model="newWebName" class="w-[240px]" placeholder="请输入新的网站名称"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false; newWebName = WebName">取消</el-button>
          <el-button type="primary" @click="dialogVisible = false; WebName = newWebName">
                确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<style scoped>

</style>
