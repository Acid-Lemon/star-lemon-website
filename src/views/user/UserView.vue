<script>
import {ElMessageBox, ElNotification} from "element-plus";
import {load_user} from "../../utils/user_info";
import {call_api} from "@/src/utils/cloud";
import {Plus} from "@element-plus/icons-vue";

import {use_user_info_store} from "../../stores/userInfo";


export default {
    components: {Plus},
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
            avatars_nums: 99,
            click_flag: -1,
            is_disabled: false,
            loading: false,
            avatar_upload_url: "",
            avatar_data: {},
            background_upload_url: "",
            background_data: {},
        };
    },
    async beforeCreate() {
        const user_info_store = use_user_info_store();
        let user_info = user_info_store.user_info;

        this.name = user_info.name;
        this.birthday = user_info?.birthday;
        this.personal_sign = user_info?.personal_sign;

        console.log(user_info);

        let avatar_name = user_info?.avatar.name;
        let type = user_info?.avatar.type;
        if (avatar_name) {
            if (type === "upload") {
                let avatar_url_res = await call_api("user/profile/get_upload_avatar_temp_url", {
                    image_name: avatar_name,
                });

                if (avatar_url_res.success === false) {
                    ElNotification({
                        title: 'Error',
                        message: avatar_url_res,
                        type: 'error',
                    });
                    console.log(avatar_url_res);
                    return;
                }

                this.avatar_url = avatar_url_res.data.temp_url
            } else {
                this.avatar_url = "/static/avatar/" + avatar_name
            }
        }

        let background_name = user_info?.profile_background_image?.name;
        if (background_name) {
            let background_url_res = await call_api("user/profile/get_background_image_temp_url", {
                image_name: background_name,
            });

            if (background_url_res.success === false) {
                ElNotification({
                    title: 'Error',
                    message: background_url_res,
                    type: 'error',
                });
                console.log(background_url_res);
                return;
            }

            this.background_url = background_url_res.data.temp_url
        }

    },
    mounted() {
        this.load_avatars();
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
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
                this.is_disabled = true;
                this.avatar = [];
                this.click_flag = index;
            } else {
                this.is_disabled = false;
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

                if (avatar_res.success === false) {
                    ElNotification({
                        title: 'Error',
                        message: avatar_res,
                        type: 'error',
                    });
                    return;
                }

                this.avatar_upload_url = avatar_res.data.upload_options.url;
                this.avatar_data = avatar_res.data.upload_options.formData;

                this.$refs.avatar.submit();
            }

            if (this.click_flag !== -1) {
                let split_avatar_path = this.avatar_list[this.click_flag].split('/');
                let avatar_res = await call_api("user/profile/choose_local_avatar", {
                    image_name: split_avatar_path[split_avatar_path.length - 1]
                });

                if (avatar_res.success === false) {
                    ElNotification({
                        title: 'Error',
                        message: avatar_res,
                        type: 'error',
                    });
                    return;
                }
            }

            if (this.background[0]) {
                let split_background_name = this.background[0].name.split('.');

                let background_res = await call_api("user/profile/create_background_image", {
                    image_type: split_background_name[split_background_name.length - 1],
                });

                if (background_res.success === false) {
                    ElNotification({
                        title: 'Error',
                        message: background_res,
                        type: 'error',
                    });
                    return;
                }

                this.background_upload_url = background_res.data.upload_options.url;
                this.background_data = background_res.data.upload_options.formData;

                this.$refs.background.submit();
            }

            if (this.name !== this.user_info.name || this.birthday !== this.user_info.birthday || this.personal_sign !== this.user_info.personal_sign) {
                if (!this.name || !this.birthday || !this.personal_sign) {
                    ElNotification({
                        title: 'Info',
                        message: '请填写完整信息',
                        type: 'info',
                    });
                    return;
                }

                let basic_info_res = await call_api("user/profile/update_profile", {
                    name: this.name,
                    birthday: this.birthday,
                    personal_sign: this.personal_sign
                });

                if (basic_info_res.success === false) {
                    ElNotification({
                        title: 'Error',
                        message: basic_info_res,
                        type: 'error',
                    });
                    return;
                }
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
                <el-tag class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]" type="primary">用户</el-tag>
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
               class="flex flex-col items-center justify-center el-overlay-dialog"
               style="padding: 10px;height: 55vh; width:65vw"
               v-bind="$attrs">
        <template #header>
            <div class="text-[2vh] font-['SYST']">编辑个人信息</div>
        </template>
        <div class="w-full h-[35vh]">
            <div class="w-full h-[25vh] flex flex-row items-center justify-center">
                <div class="w-[20vh] my-[5px]">
                    <span>头像：</span>
                    <el-upload
                        ref=avatar
                        v-model:file-list=avatar
                        :action=avatar_upload_url
                        :auto-upload=false
                        :data=avatar_data
                        :disabled=is_disabled
                        :show-file-list=false
                        list-type="picture"
                        style="width: 15vh;height: 15vh;border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                    >
                        <el-image v-if="avatar.length !== 0" :src="avatar[0].url" alt="avatar"
                                  class="w-[15vh] h-[15vh]"/>
                        <el-icon v-else
                                 style="width: 15vh;height: 15vh;font-size: 28px;color: #8c939d;text-align: center;">
                            <Plus/>
                        </el-icon>
                    </el-upload>
                </div>
                <div class="w-[35vh] my-[5px]">
                    <span @click="this.background">个人背景：</span>
                    <el-upload
                        ref=background
                        v-model:file-list=background
                        :action=background_upload_url
                        :auto-upload=false
                        :data=background_data
                        :show-file-list=false
                        list-type="picture"
                        style="width: 30vh;height: 15vh;border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                    >
                        <el-image v-if="background.length !== 0" :src="background[0].url" alt="background"
                                  class="w-[30vh] h-[15vh]"/>
                        <el-icon v-else
                                 style="width: 30vh;height: 15vh;font-size: 28px;color: #8c939d;text-align: center;">
                            <Plus/>
                        </el-icon>
                    </el-upload>
                </div>
                <div class="w-[50vh] my-[5px]">
                    <el-scrollbar height="250px">
                        <div class="grid gap-x-4 gap-y-[20px] grid-cols-4 auto-rows-auto w-full h-full">
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
            <div class="w-full h-[10vh] flex flex-row items-center justify-between">
                <div class="w-[15vh] my-[5px]">
                    <span>用户名：</span>
                    <el-input v-model="name" class="w-full"/>
                </div>
                <div class="w-[15vh] my-[5px]">
                    <span>生日：</span>
                    <el-date-picker v-model="birthday" size="default" style="width: 100%" type="date"
                                    value-format="YYYY年MM月DD日"/>
                </div>
                <div class="w-[60vh] my-[5px]">
                    <span>个性签名：</span>
                    <el-input v-model="personal_sign" class="w-full"/>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex flex-row justify-end items-end">
                <el-button class="mx-[40px]" @click="dialog_visible = false">取消</el-button>
                <el-button v-loading.fullscreen.lock="loading" class="mx-[40px]" type="primary"
                           @click="update_info()">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.el-overlay-dialog {
    overflow: hidden !important;
}
</style>
