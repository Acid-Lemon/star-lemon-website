<script>
import {ElMessageBox} from "element-plus";
import ArticleAdminView from "../write/write-admin.vue";
import {use_user_info_store} from "../../stores/userInfo";
import {ArrowRight, CaretBottom, CaretTop, Warning} from "@element-plus/icons-vue";
import AdminView from "@/src/components/admin.vue";
import {call_api} from "@/src/utils/cloud";

export default {
    name: "index-admin",
    inheritAttrs: false,
    components: {
        AdminView,
        ArrowRight,
        CaretBottom,
        Warning,
        CaretTop,
        ArticleAdminView,
        ElMessageBox
    },
    data() {
        return {
            statistical_data: {
                article_num: 0,
                message_num: 0
            }
        };
    },
    computed: {
        user_info() {
            const user_info_store = use_user_info_store();
            return user_info_store.user_info;
        }
    },
    async mounted() {
        let res = await call_api("statistical_data/get_num");

        if (!res.success) {
            return;
        }

        this.statistical_data = {
            ...res.data
        };
    },
    methods: {
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
    }
};
</script>

<template>
    <admin-view>
        <div class="w-full h-full bg-[#F8FAFD]">
            <div class="w-full flex flex-row items-center justify-evenly mt-[20px]">
                <el-card class="w-[30%] h-[210px]">
                    <template #header>
                        <div class="card-header">
                            <div class="font-['SYST']">管理员信息</div>
                        </div>
                    </template>
                    <div class="font-['SYST']">用户名：{{ user_info.name }}</div>
                    <div class="font-['SYST']">用户身份：{{ user_info?.role }}</div>
                    <template #footer>
                        <div class="font-['SYST']">
                            {{ get_time_greetings() }}
                        </div>
                    </template>
                </el-card>
                <el-card body-class="w-full h-full flex flex-row items-center justify-around" class="w-[65%] h-[210px]">
                    <el-statistic :value="statistical_data.article_num"
                                  class="flex flex-col items-center justify-center">
                        <template #title>
                            <div class="font-['SYST'] text-[2vh]">
                                文章数量
                            </div>
                        </template>
                    </el-statistic>
                    <el-statistic :value="statistical_data.message_num"
                                  class="flex flex-col items-center justify-center">
                        <template #title>
                            <div class="font-['SYST'] text-[2vh]">
                                留言数量
                            </div>
                        </template>
                    </el-statistic>
                </el-card>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>

</style>
