<script>
import {ElMessageBox, ElNotification} from "element-plus";
import {load_user} from "../../utils/user_info";
import {call_api} from "@/src/utils/cloud";
import {Delete, Plus} from "@element-plus/icons-vue";

import {use_user_info_store} from "../../stores/userInfo";
import {get_background} from "@/src/utils/get_background";
import {get_avatar} from "@/src/utils/get_avatar";


export default {
    components: {Delete, Plus},
    data() {
        return {
            avatar_url: "",
            background_url: "",
            dialog_visible: false,
            name: "",
            birthday: "",
            personal_sign: "",
            avatar: [],
            background: [],
            avatar_list: [],
            avatars_nums: 46,
            click_flag: -1,
            loading: false,
            avatar_upload_url: "",
            avatar_data: {},
            background_upload_url: "",
            background_data: {},
        };
    },
    async mounted() {
        this.avatar_url = await get_avatar();
        this.background_url = await get_background();

        this.load_avatars();

        this.name = this.user_info?.name;
        this.birthday = this.user_info?.birthday;
        this.personal_sign = this.user_info?.personal_sign;
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
        disabled() {
            return this.avatar.length !== 0 || this.click_flag !== -1
        }
    },
    methods: {
        load_avatars() {
            while (this.avatars_nums > 0) {
                this.avatar_list.push(`/static/avatar/${this.avatars_nums}.jpg`);
                this.avatars_nums--;
            }
        },
        handle_close(done) {
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
            if (this.click_flag !== index) {
                this.avatar = [];
                this.click_flag = index;
            } else {
                this.click_flag = -1;
            }
        },
        get_profile(field) {
            if (!this.info?.[field] && field === "name") {
                return "未登录";
            } else {
                this[field] = this.info?.[field];
                return this.info?.[field];
            }
        },
        async update_info() {
            this.loading = true;

            if (this.avatar[0]) {
                let split_avatar_name = this.avatar[0].name.split('.');

                let avatar_res = await call_api("user/profile/create_upload_avatar", {
                    image_type: split_avatar_name[split_avatar_name.length - 1],
                });

                if (!avatar_res.success) {
                    this.loading = false;
                    return;
                }
                ElNotification({
                    title: 'Success',
                    message: "修改头像成功",
                    type: 'success',
                })

                this.avatar_upload_url = avatar_res.data.upload_options.url;
                this.avatar_data = avatar_res.data.upload_options.formData;

                this.$refs.avatar.submit();
            }

            if (this.click_flag !== -1) {
                let split_avatar_path = this.avatar_list[this.click_flag].split('/');
                let avatar_res = await call_api("user/profile/choose_local_avatar", {
                    image_name: split_avatar_path[split_avatar_path.length - 1]
                });

                if (!avatar_res.success) {
                    this.loading = false;
                    return;
                }

                ElNotification({
                    title: 'Success',
                    message: "修改头像成功",
                    type: 'success',
                })
            }

            if (this.background[0]) {
                let split_background_name = this.background[0].name.split('.');

                let background_res = await call_api("user/profile/create_background_image", {
                    image_type: split_background_name[split_background_name.length - 1],
                });

                if (!background_res.success) {
                    this.loading = false;
                    return;
                }

                ElNotification({
                    title: 'Success',
                    message: "修改背景成功",
                    type: 'success',
                })

                this.background_upload_url = background_res.data.upload_options.url;
                this.background_data = background_res.data.upload_options.formData;

                this.$refs.background.submit();
            }

            if (this.name !== this.user_info.name || this.birthday !== this.user_info.birthday || this.personal_sign !== this.user_info.personal_sign) {

                let basic_info_res = await call_api("user/profile/update_profile", {
                    name: this.name,
                    birthday: this.birthday,
                    personal_sign: this.personal_sign
                });

                if (!basic_info_res.success) {
                    this.loading = false;
                    return;
                }

                ElNotification({
                    title: 'Success',
                    message: "修改基本信息成功",
                    type: 'success',
                })
            }

            localStorage.removeItem("user");
            await load_user();

            this.loading = false;
            this.dialog_visible = false;
        },
    }
}
</script>

<template>
    <div class="h-full w-full el-overlay-dialog">
        <div class="w-full h-[40vh] relative">
            <el-image :src="background_url" class="w-full h-[40vh]" fit="cover">
                <template #error>
                    <el-image class="w-full h-[40vh]" fit="cover" src="/static/background/17.jpg"></el-image>
                </template>
            </el-image>
            <div class="absolute bottom-[-5vh] left-[10vw] flex flex-row items-end">
                <el-avatar :size=100 :src=avatar_url alt="头像" class="mr-[10px]">
                    {{ user_info?.name ? user_info.name : "未登录" }}
                </el-avatar>
                <p class="font-['SYST'] text-[24px] mr-[20px] leading-none pb-[5px]">{{
                        user_info?.name ? user_info.name : "未登录"
                    }}</p>
                <el-tag v-if="user_info?.role==='admin'"
                        class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]" type="success">管理员
                </el-tag>
                <el-tag v-else class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]" type="primary">用户
                </el-tag>
                <p v-if="user_info?.birthday" class="font-['SYST'] text-[14px] mr-[20px] leading-none pb-[5px]">
                    生日：{{ user_info?.birthday }}</p>
                <p class="font-['SYST'] text-[14px] opacity-50 leading-none pb-[5px]">{{ user_info?.personal_sign }}</p>
            </div>
            <el-button class="absolute bottom-[-5vh] right-[10vw]" plain @click="dialog_visible = true">
                编辑信息
            </el-button>
        </div>
        <div class="w-full h-[60vh] flex flex-col items-center justify-center bg-[#F8FAFD]">
        </div>
    </div>
    <el-dialog v-model="dialog_visible" :before-close="handle_close" align-center
               style="padding: 10px;height: 28vw; width:60vw; display: flex; flex-direction: column; justify-content: center; align-items: center;"
               v-bind="$attrs">
        <div class="w-full mb-[1vw] text-center text-[1.5vw] font-['SYST']">编辑个人信息</div>
        <div class="w-full h-[16vw] flex flex-col items-center justify-center">
            <div class="flex flex-row">
                <div class="w-[8vw] m-[1vw]">
                    <span>头像：</span>
                    <el-upload
                        ref=avatar
                        v-model:file-list=avatar
                        :action=avatar_upload_url
                        :auto-upload=false
                        :data=avatar_data
                        :disabled=disabled
                        :show-file-list=false
                        list-type="picture"
                        on-remove="handleRemove"
                        style="width: 8vw;height: 8vw; border: 1px dashed var(--el-border-color); border-radius: 6px; cursor: pointer; position: relative;overflow: hidden; transition: var(--el-transition-duration-fast);"
                    >
                        <el-image v-if="avatar.length !== 0" :src="avatar[0].url" alt="avatar"
                                  class="w-full h-full"/>
                        <el-icon v-else
                                 :class="['transition-transform duration-300 ease-in-out', disabled ? 'rotate-45' : '']"
                                 style="width: 8vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;">
                            <Plus/>
                        </el-icon>
                        <div v-if="avatar.length !== 0"
                             class="w-full h-full absolute bg-black hover:bg-opacity-50 bg-opacity-0 hover:opacity-100 opacity-0 transform duration-300">
                            <el-icon style="width: 8vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;"
                                     @click="this.avatar = []">
                                <Delete/>
                            </el-icon>
                        </div>
                    </el-upload>
                </div>
                <div class="w-[16vw] m-[1vw]">
                    <span @click="this.background">个人背景：</span>
                    <el-upload
                        ref=background
                        v-model:file-list=background
                        :action=background_upload_url
                        :auto-upload=false
                        :data=background_data
                        :show-file-list=false
                        list-type="picture"
                        style="width: 16vw; height: 8vw; border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                    >
                        <el-image v-if="background.length !== 0" :src="background[0].url" alt="background"
                                  class="w-[16vw] h-[8vw]"/>
                        <el-icon v-else
                                 style="width: 16vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;">
                            <Plus/>
                        </el-icon>
                        <div v-if="background.length !== 0"
                             class="w-full h-full absolute bg-black hover:bg-opacity-50 bg-opacity-0 hover:opacity-100 opacity-0 transform duration-300">
                            <el-icon
                                style="width: 16vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;"
                                @click="this.background = []">
                                <Delete/>
                            </el-icon>
                        </div>
                    </el-upload>
                </div>
                <div class="w-[25vw] m-[1vw]">
                    <div>默认头像：</div>
                    <el-scrollbar style="width: 100%; height: 8vw">
                        <div
                            :class="['w-full h-full grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto', this.avatar.length !== 0 ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100']">
                            <div v-for="(avatar,index) in avatar_list" :key="avatar"
                                 :class="{'border-[2px] border-[#08d9d6]':click_flag === index}"
                                 class="w-full shadow-md"
                                 @click="choose(index)">
                                <el-image :src=avatar class="w-full h-full" fit="cover"/>
                            </div>
                        </div>
                    </el-scrollbar>


                </div>
            </div>
            <div class="flex flex-row">
                <div class="w-[10vw] m-[1vw]">
                    <span>用户名：</span>
                    <el-input v-model="name" class="w-full"/>
                </div>
                <div class="w-[10vw] m-[1vw]">
                    <span>生日：</span>
                    <el-date-picker v-model="birthday" size="default" style="width: 100%" type="date"
                                    value-format="YYYY年MM月DD日"/>
                </div>
                <div class="w-[30vw] m-[1vw]">
                    <span>个性签名：</span>
                    <el-input v-model="personal_sign" class="w-full"/>
                </div>
            </div>
        </div>
        <div class="w-full flex flex-row justify-end items-center m-[1vw] pr-[1vw]">
            <el-button class="mx-[1vw]" @click="dialog_visible = false">取消</el-button>
            <el-button v-loading.fullscreen.lock="loading" class="mx-[1vw]" type="primary"
                       @click="update_info()">
                确定
            </el-button>
        </div>
    </el-dialog>
</template>

<style scoped>
</style>
