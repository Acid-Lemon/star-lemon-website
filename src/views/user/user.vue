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
            dialog_visible: {
                update_user_info: false,
            },
            avatar_url: "",
            background_url: "",
            new_user_info: {
                avatar: [],
                background: [],
                click_flag: -1,
                email: "",
                code: "",
                name: "",
                birthday: "",
                personal_sign: "",
            },
            code: {
                disabled: false,
                wait_time: 60,
                text: "获取验证码",
            },
            avatar_list: [],
            avatars_nums: 46,
            loading: false,
            avatar_data: {
                upload_url: "",
                upload_data: null
            },
            background_data: {
                upload_url: "",
                upload_data: null
            },
        };
    },
    async mounted() {
        this.avatar_url = await get_avatar(this.user_info?.avatar);
        this.background_url = await get_background(this.user_info?.profile_background_image);

        this.load_avatars();

        this.new_user_info = {
            ...this.user_info,
            avatar: [],
            background: [],
            click_flag: -1,
        };
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        },
        disabled() {
            return this.new_user_info.avatar.length !== 0 || this.new_user_info.click_flag !== -1
        }
    },
    methods: {
        load_avatars() {
            while (this.avatars_nums > 0) {
                this.avatar_list.push(`/static/avatar/${this.avatars_nums}.jpg`);
                this.avatars_nums--;
            }
        },
        handle_close_update_user_info(done) {
            if (this.new_user_info.click_flag !== -1 || this.new_user_info.avatar.length !== 0 || this.new_user_info.background.length !== 0
                || this.new_user_info.name !== this.user_info.name || this.new_user_info.birthday !== this.user_info.birthday || this.new_user_info.personal_sign !== this.user_info.personal_sign) {
                ElMessageBox.confirm('确认关闭？（未提交的信息不会保存）', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    done();
                }).catch(() => {
                    this.avatar = [];
                    this.click_flag = -1;
                    this.new_user_info.name = this.user_info?.name;
                    this.new_user_info.birthday = this.user_info?.birthday;
                    this.new_user_info.personal_sign = this.user_info?.personal_sign;
                })
                return;
            }
            done();
        },
        choose(index) {
            if (this.new_user_info.click_flag !== index) {
                this.new_user_info.click_flag = index;
            } else {
                this.new_user_info.click_flag = -1;
            }
        },
        async update_user_info() {
            this.loading = true;

            if (this.new_user_info.avatar[0]) {
                let split_avatar_name = this.new_user_info.avatar[0].name.split('.');

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

                this.avatar_data = {
                    upload_url: avatar_res.data.upload_options.url,
                    upload_data: avatar_res.data.upload_options.formData
                };

                this.$refs.avatar.submit();
            }

            if (this.new_user_info.click_flag !== -1) {
                let avatar_res = await call_api("user/profile/choose_local_avatar", {
                    image_name: this.avatar_list[this.new_user_info.click_flag]
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

            if (this.new_user_info.background[0]) {
                let split_background_name = this.new_user_info.background[0].name.split('.');

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

                this.background_data = {
                    upload_url: background_res.data.upload_options.url,
                    upload_data: background_res.data.upload_options.formData
                };

                this.$refs.background.submit();
            }

            if (this.new_user_info.email !== this.user_info.email || this.new_user_info.name !== this.user_info.name || this.new_user_info.birthday !== this.user_info?.birthday || this.new_user_info.personal_sign !== this.user_info?.personal_sign) {
                let basic_info_res = await call_api("user/profile/update_profile", {
                    email: this.new_user_info.email,
                    name: this.new_user_info.name,
                    birthday: this.new_user_info.birthday,
                    personal_sign: this.new_user_info.personal_sign
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

            await load_user();

            this.loading = false;
            this.dialog_visible.update_user_info = false;
        },
        cancel_update_user_info() {
            this.new_user_info.avatar = [];
            this.new_user_info.click_flag = -1;
            this.new_user_info.name = this.user_info?.name;
            this.new_user_info.birthday = this.user_info?.birthday;
            this.new_user_info.personal_sign = this.user_info?.personal_sign;

            this.dialog_visible.update_user_info = false;
        },
        async get_email_code() {
            this.code.disabled = true;

            let res = await call_api(`user/login/send_email_code`, {
                email: this.new_user_info.email,
                mode: "登录"
            })

            if (!res.success) {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: res,
                });
                this.code.disabled = false;
                return;
            }

            ElNotification({
                title: 'Success',
                type: "success",
                message: "验证码已发送",
            })

            let Interval = setInterval(() => {
                this.code.text = `${this.code.wait_time}s`;
                this.code.wait_time--;
                if (this.code.wait_time === 0) {
                    clearInterval(Interval);
                    this.code = {
                        text: "获取验证码",
                        disabled: false,
                        wait_time: 60
                    }
                }
            }, 1000)
        },
    }
}
</script>

<template>
    <div class="h-full w-full flex flex-col">
        <el-image :src="this.background_url" class="w-full h-[40vh]" fit="cover">
            <template #error>
                <el-image class="w-full h-[40vh]" fit="cover" src="/static/background/17.jpg"></el-image>
            </template>
        </el-image>
        <div class="fixed top-[36vh] left-[5vw] flex flex-row items-end">
            <el-avatar :size=80 :src="this.avatar_url" alt="头像" class="mr-[10px]">
                {{ user_info?.name ? user_info.name : "无名" }}
            </el-avatar>
            <div class="flex flex-row items-center">
                <div class="font-['SYST'] text-[20px] mr-[20px] leading-none pb-[5px]">
                    {{ user_info?.name ? user_info.name : "无名" }}
                </div>
                <el-tag class="font-['SYST'] text-[16px] mr-[10px] leading-none pb-[5px]" type="primary">
                    {{ user_info?.role === 'admin' ? '管理员' : '用户' }}
                </el-tag>
                <div v-if="user_info?.birthday" class="font-['SYST'] text-[16px] mr-[20px] leading-none pb-[5px]">
                    生日：{{ user_info?.birthday }}
                </div>
                <div class="font-['SYST'] text-[16px] opacity-50 leading-none pb-[5px]">{{
                        user_info?.personal_sign
                    }}
                </div>
                <el-button class="ml-[2vw]" plain
                           @click="this.dialog_visible.update_user_info = true">
                    编辑信息
                </el-button>
            </div>
        </div>
        <div class="w-full h-[60vh] flex flex-col p-[5vh] bg-[#F8FAFD]">

        </div>
    </div>

    <el-dialog v-model="this.dialog_visible.update_user_info" :before-close="handle_close_update_user_info"
               align-center width="60%">
        <div class="w-full min-h-[1.5vw] mb-[1vw] text-center text-[1.2vw] font-['SYST']">编辑个人信息</div>
        <div class="p-[20px]">
            <div class="w-full grid grid-cols-2 gap-x-2 mb-[20px]">
                <div>
                    <div class="w-full grid grid-cols-3 gap-x-2 mb-[20px]">
                        <div class="col-span-1">
                            <span>头像：</span>
                            <el-upload
                                ref=avatar
                                v-model:file-list=this.new_user_info.avatar
                                :action=this.avatar_data.upload_url
                                :auto-upload=false
                                :data=this.avatar_data.upload_data
                                :disabled=this.disabled
                                :show-file-list=false
                                list-type="picture"
                                on-remove="handleRemove"
                                style="aspect-ratio: 1/1; border: 1px dashed var(--el-border-color); border-radius: 6px; cursor: pointer; position: relative;overflow: hidden; transition: var(--el-transition-duration-fast);"
                            >
                                <el-image v-if="this.new_user_info?.avatar?.length !== 0"
                                          :src="this.new_user_info?.avatar[0]?.url || null"
                                          alt="avatar"
                                          class="w-full h-full"/>
                                <el-icon v-else
                                         :class="['transition-transform duration-300 ease-in-out', this.disabled ? 'rotate-45' : '']"
                                         style="width: 8vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;">
                                    <Plus/>
                                </el-icon>
                                <div v-if="this.new_user_info.avatar.length !== 0"
                                     class="w-full h-full absolute bg-black hover:bg-opacity-50 bg-opacity-0 hover:opacity-100 opacity-0 transform duration-300">
                                    <el-icon
                                        style="width: 8vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;"
                                        @click="this.new_user_info.avatar = []">
                                        <Delete/>
                                    </el-icon>
                                </div>
                            </el-upload>
                        </div>
                        <div class="col-span-2">
                            <span>个人背景：</span>
                            <el-upload
                                ref=background
                                v-model:file-list=this.new_user_info.background
                                :action=this.background_data.upload_url
                                :auto-upload=false
                                :data=this.background_data.upload_data
                                :show-file-list=false
                                list-type="picture"
                                style="aspect-ratio: 2/1; border: 1px dashed var(--el-border-color);border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;transition: var(--el-transition-duration-fast);"
                            >
                                <el-image v-if="this.new_user_info?.background?.length !== 0"
                                          :src="this.new_user_info?.background[0]?.url || null"
                                          alt="background"
                                          class="w-[16vw] h-[8vw]"/>
                                <el-icon v-else
                                         style="width: 16vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;">
                                    <Plus/>
                                </el-icon>
                                <div v-if="this.new_user_info.background.length !== 0"
                                     class="w-full h-full absolute bg-black hover:bg-opacity-50 bg-opacity-0 hover:opacity-100 opacity-0 transform duration-300">
                                    <el-icon
                                        style="width: 16vw;height: 8vw;font-size: 28px;color: #8c939d;text-align: center;"
                                        @click="this.new_user_info.background = []">
                                        <Delete/>
                                    </el-icon>
                                </div>
                            </el-upload>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-x-2 items-end">
                        <div class="col-span-2">
                            <span>邮箱：</span>
                            <el-input v-model="new_user_info.email"/>
                        </div>
                        <div class="col-span-1">
                            <el-button :disabled="code.disabled"
                                       @click="get_email_code">
                                {{ this.code.text }}
                            </el-button>
                        </div>
                        <div class="col-span-1">
                            <span>验证码：</span>
                            <el-input v-model="new_user_info.code"/>
                        </div>
                    </div>
                </div>
                <div class="w-full grid grid-cols-1 gap-2">
                    <div>默认头像：</div>
                    <el-scrollbar style="aspect-ratio: 2/1">
                        <div
                            :class="['w-full h-full grid gap-x-4 gap-y-4 grid-cols-5 auto-rows-auto', this.new_user_info.avatar.length !== 0 ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100']">
                            <div v-for="(avatar,index) in avatar_list" :key="avatar"
                                 :class="{'border-[2px] border-[#08d9d6]':this.new_user_info.click_flag === index}"
                                 class="w-full shadow-md"
                                 @click="choose(index)">
                                <el-image :src=avatar class="w-full h-full" fit="cover"/>
                            </div>
                        </div>
                    </el-scrollbar>
                </div>
            </div>
            <div class="w-full grid grid-cols-4 gap-2">
                <div class="col-span-1">
                    <span>用户名：</span>
                    <el-input v-model="new_user_info.name" class="w-full"/>
                </div>
                <div class="col-span-1">
                    <span>生日：</span>
                    <el-date-picker v-model="new_user_info.birthday" size="default" style="width: 100%" type="date"
                                    value-format="YYYY年MM月DD日"/>
                </div>
                <div class="col-span-2">
                    <span>个性签名：</span>
                    <el-input v-model="new_user_info.personal_sign" class="w-full"/>
                </div>
            </div>
        </div>
        <div class="w-full min-h-[1.5vw] flex flex-row justify-end items-center m-[1vw] pr-[1vw]">
            <el-button class="mx-[1vw]" @click="cancel_update_user_info()">取消</el-button>
            <el-button v-loading.fullscreen.lock="loading" class="mx-[1vw]" type="primary"
                       @click="update_user_info()">
                确定
            </el-button>
        </div>
    </el-dialog>
</template>

<style scoped>
</style>
