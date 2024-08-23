<script>
import {ElMessageBox} from "element-plus";
import {use_web_config_store} from "../../stores/webConfig";
import ArticleAdminView from "../write/WriteAdminView.vue";
import {use_user_info_store} from "../../stores/userInfo";

export default {
    components: {
        ArticleAdminView,
        ElMessageBox
    },
    data() {
        return {
            web_name: "",
            new_web_name: "",
            web_name_dialog: false,
            time_state: "",
            info: "",
        };
    },
    computed: {
        web_config() {
            const web_config_store = use_web_config_store();
            return web_config_store.web_config;
        },
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        }
    },
    async mounted() {
        this.web_name = this.web_config?.web_name;
        this.new_web_name = this.web_config?.web_name;

    },
    methods: {
        handle_close(done) {
            ElMessageBox.confirm('你确定取消更改吗?（已输入的内容不会被保存）').then(() => {
                done()
            }).catch(() => {
                // catch error
            })
        },
        get_time_greetings() {
            const now = new Date();
            const hours = now.getHours();

            if (5 <= hours && hours < 8) {
                return "早上好呀，早起的鸟儿有虫吃！";
            }
            if (8 <= hours && hours < 12) {
                return "上午好呀，又是活力满满的一天~";
            }
            if (12 <= hours && hours < 14) {
                return "中午好呀，有没有吃午饭呢？";
            }
            if (14 <= hours && hours < 18) {
                return "下午好呀，努力工作的小伙伴~";
            }
            if (18 <= hours && hours < 19) {
                return "傍晚好呀，别忘了喝杯茶~";
            }
            if (19 <= hours && hours <= 23) {
                return "晚上好呀，记得早点睡哦~";
            }
            if (0 <= hours && hours < 5) {
                return "凌晨好呀，熬夜不好哦";
            }
        },
        change_web_name() {
            this.web_name_dialog = false;
            this.web_config.web_name = this.new_web_name;
        },
        close_dialog() {
            this.web_name_dialog = false;
            this.new_web_name = this.web_name;
        }
    }
};
</script>

<template>
    <admin-view>
        <div class="w-full h-full bg-[#F8FAFD]">
            <el-card class="w-[480px] ml-[20px] mt-[20px]">
                <template #header>
                    <div class="card-header">
                        <span>网站信息</span>
                    </div>
                </template>
                <div @click="web_name_dialog = true">网站名称：{{ web_name }}</div>
                <template #footer>{{ user_info.name }}，{{ get_time_greetings() }}</template>
            </el-card>
        </div>
    </admin-view>
    <el-dialog
        v-model="web_name_dialog"
        :before-close="handle_close"
        title="修改信息"
        width="500"
    >
        <el-input v-model="new_web_name" class="w-[240px]" placeholder="请输入新的网站名称"/>
        <template #footer>
            <div class="dialog-footer">
                <el-button
                    @click="close_dialog">取消
                </el-button>
                <el-button type="primary"
                           @click="change_web_name">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>
