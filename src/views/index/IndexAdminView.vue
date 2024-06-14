<script>
import {ElMessageBox} from "element-plus";
import {useWebConfigStore} from "../../stores/webConfig";

export default {
  components: {
    ElMessageBox
  },
  data() {
    return {
      webName: useWebConfigStore().webName,
      newWebName: useWebConfigStore().webName,
      webIcon: "https://starlemon.oss-cn-beijing.aliyuncs.com/img/202303191645712.png",
      newWebIcon: "https://starlemon.oss-cn-beijing.aliyuncs.com/img/202303191645712.png",
      username: "lemon",
      webNameDialog: false,
      webIconDialog: false,
      timeState: "",
    };
  },
  mounted() {
    let time = new Date().getHours()
  },
  methods: {
    handleClose(done) {
      ElMessageBox.confirm('你确定取消更改吗?（已输入的内容不会被保存）')
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
  <div class="w-full h-full bg-[#F8FAFD]">
    <el-card class="w-[480px] ml-[20px] mt-[20px]">
      <template #header>
        <div class="card-header">
          <span>网站信息</span>
        </div>
      </template>
      <div @click="webNameDialog = true">网站名称：{{ webName }}</div>
      <div @click="webIconDialog = true">网站图标：{{ webIcon }}</div>
      <template #footer>{{ username }}上午好！</template>
    </el-card>
    <el-dialog
        v-model="webNameDialog"
        :before-close="handleClose"
        title="修改信息"
        width="500"
    >
      <el-input v-model="newWebName" class="w-[240px]" placeholder="请输入新的网站名称"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button
              @click="webNameDialog = false; newWebName = webName">取消
          </el-button>
          <el-button type="primary"
                     @click="webNameDialog = false; webName = newWebName">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
        v-model="webIconDialog"
        :before-close="handleClose"
        title="修改信息"
        width="500"
    >
      <el-input v-model="newWebIcon" class="w-[240px]" placeholder="请输入新的网站图标链接"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button
              @click="webIconDialog = false; newWebIcon = webIcon">取消
          </el-button>
          <el-button type="primary"
                     @click="webIconDialog = false; webIcon = newWebIcon">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>
