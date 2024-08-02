<script>
import {ElMessageBox, ElNotification} from "element-plus";
import {load_user} from "../../utils/user_info";
import {call_api} from "@/src/utils/cloud";
import {Plus} from "@element-plus/icons-vue";


import {useUserInfoStore} from "../../stores/userInfo";


export default {
  components: {Plus},
  data() {
    return {
      dialog_visible: false,
      name: null,
      birthday: null,
      personal_sign: null,
      avatar: [],
      background: [],
      avatar_list: [],
      avatars_nums: 99,
      click_flag: -1,
      is_disabled: false,
    };
  },
  mounted() {
    this.name = this.userInfo.name;
    this.birthday = this.userInfo.birthday;
    this.personal_sign = this.userInfo.personal_sign;
    this.loadAvatars();
  },
  computed: {
    userInfo() {
      const userInfoStore = useUserInfoStore();
      return userInfoStore.userInfo;
    }
  },
  methods: {
    loadAvatars() {
      while (this.avatars_nums > 0) {
        this.avatar_list.push(`/static/avatar/${this.avatars_nums}.jpg`);
        this.avatars_nums--;
      }
    },
    handleClose(done) {
      ElMessageBox.confirm('确认关闭？（未提交的信息不会保存）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done();
      })
          .catch(() => {
          });
    },
    choose(index) {
      if(this.click_flag !== index) {
        this.is_disabled = true;
        this.avatar = [];
        this.click_flag = index;
      } else {
        this.is_disabled = false;
        this.click_flag = -1;
      }
    },
    get_info(field) {
      if (!this.info?.[field] && field === "name") {
        return "未登录";
      } else {
        this[field] = this.info?.[field];
        return this.info?.[field];
      }
    },
    async update_info() {

      if (!this.name || !this.birthday || !this.personal_sign) {
        ElNotification({
          title: 'Info',
          message: '请填写完整信息',
          type: 'info',
        });
        return;
      }
      let res = await call_api("user/info/update_basic_info", {
        name: this.name,
        birthday: this.birthday,
        personal_sign: this.personal_sign
      });
      if (res.success === false) {
        ElNotification({
          title: 'Error',
          message: res,
          type: 'error',
        });
        return;
      }

      localStorage.removeItem("user");
      await load_user();

      this.dialog_visible = false;
    },
  }
}
</script>

<template>
  <div class="h-full w-full el-overlay-dialog">
    <div class="bg-[url('/static/background/12.jpg')] bg-cover bg-center h-[40vh] relative">
      <div class="absolute bottom-[-5vh] left-[10vw] flex flex-row items-end">
        <img alt="头像" class="h-[10vh] w-[10vh] rounded-full mr-[10px]" src="/static/favicon/favicon.png"/>
        <p class="font-['SYST'] text-[24px] mr-[20px] leading-none pb-[5px]">{{ userInfo?.name ? userInfo.name : "未登录" }}</p>
        <el-tag class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]" type="primary" >用户</el-tag>
        <p v-if="userInfo?.birthday" class="font-['SYST'] text-[14px] mr-[20px] leading-none pb-[5px]">生日：{{ userInfo?.birthday }}</p>
        <p class="font-['SYST'] text-[14px] opacity-50 leading-none pb-[5px]">{{ userInfo?.personal_sign }}</p>
      </div>
      <el-button class="absolute bottom-[-5vh] right-[10vw]" plain @click="dialog_visible = true">
        编辑信息
      </el-button>
      <el-dialog v-model="dialog_visible" :before-close="handleClose" align-center
                 class="flex flex-col items-center justify-center el-overlay-dialog"
                 style="padding: 50px;height: 56vh;width:120vh">
        <template #header>
          <div class="text-[2vh]">编辑个人信息</div>
        </template>
        <template #default>
        <div class="w-full h-[25vh] flex flex-row items-center justify-center">
          <div class="w-[20vh] my-[5px]">
            <span>头像：</span>
            <el-upload
                style="width: 15vh;height: 15vh;border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                :file-list = avatar
                action=""
                list-type="picture"
                :auto-upload = false
                :disabled="is_disabled"
            >
              <img v-if="avatar.length !== 0" :src="avatar" style="width: 15vh;height: 15vh" alt="avatar"/>
              <el-icon v-else style="width: 15vh;height: 15vh;font-size: 28px;color: #8c939d;text-align: center;"><Plus /></el-icon>
            </el-upload>
          </div>
          <div class="w-[35vh] my-[5px]">
            <span @click="this.background">个人背景：</span>
              <el-upload
                  style="width: 30vh;height: 15vh;border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                  :file-list = background
                  action=""
                  list-type="picture"
                  :auto-upload = false
              >
                <img v-if="background.length !== 0" :src="background" style="width: 30vh;height: 15vh" alt="background"/>
                <el-icon v-else style="width: 30vh;height: 15vh;font-size: 28px;color: #8c939d;text-align: center;"><Plus /></el-icon>
              </el-upload>
            </div>
          <div class="w-[50vh] my-[5px]">
            <el-scrollbar height="250px">
              <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto w-full h-full">
                <div v-for="(avatar,index) in avatar_list" :key="avatar"
                     :class="{'border-[2px] border-[#08d9d6]':click_flag === index}"
                     class="w-full shadow-md"
                     @click="choose(index)">
                  <el-image :src="avatar" class="w-full h-full" fit="cover"/>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
        <div class="w-full h-[10vh] flex flex-row items-center justify-between">
          <div class="w-[15vh] my-[5px]">
            <span>用户名：</span>
            <el-input v-model="name" class="w-full"/>
          </div>
          <div class="w-[15vh] my-[5px]">
            <span>生日：</span>
            <el-date-picker v-model="birthday" value-format="YYYY年MM月DD日" size="default" style="width: 100%" type="date"/>
          </div>
          <div class="w-[60vh] my-[5px]">
            <span>个性签名：</span>
            <el-input v-model="personal_sign" class="w-full"/>
          </div>
        </div>
        </template>
        <template #footer>
          <div class="flex flex-row justify-end items-end">
            <el-button class="mx-[40px]" @click="dialog_visible = false">取消</el-button>
            <el-button class="mx-[40px]" type="primary" @click="update_info()">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
    <div class="w-full h-[60vh] flex flex-col items-center justify-center bg-[#F8FAFD]">
    </div>
  </div>
</template>

<style scoped>
.el-overlay-dialog{
  overflow: hidden !important;
}
</style>
