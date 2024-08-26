<script>
import {ElMessageBox} from "element-plus";
import {use_web_config_store} from "../../stores/webConfig";
import ArticleAdminView from "../write/WriteAdminView.vue";
import {use_user_info_store} from "../../stores/userInfo";
import {ArrowRight, CaretBottom, CaretTop, Warning} from "@element-plus/icons-vue";

export default {
    components: {
        ArrowRight,
        CaretBottom,
        Warning,
        CaretTop,
        ArticleAdminView,
        ElMessageBox
    },
    data() {
        return {};
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
                <el-card class="w-[65%] h-[210px]">
                    <el-row :gutter="16">
                        <el-col :span="8">
                            <div class="statistic-card">
                                <el-statistic :value="98500">
                                    <template #title>
                                        <div style="display: inline-flex; align-items: center">
                                            Daily active users
                                            <el-tooltip
                                                content="Number of users who logged into the product in one day"
                                                effect="dark"
                                                placement="top"
                                            >
                                                <el-icon :size="12" style="margin-left: 4px">
                                                    <Warning/>
                                                </el-icon>
                                            </el-tooltip>
                                        </div>
                                    </template>
                                </el-statistic>
                                <div class="statistic-footer">
                                    <div class="footer-item">
                                        <span>than yesterday</span>
                                        <span class="green">
                                            24%
                                            <el-icon>
                                                <CaretTop/>
                                            </el-icon>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="statistic-card">
                                <el-statistic :value="693700">
                                    <template #title>
                                        <div style="display: inline-flex; align-items: center">
                                            Monthly Active Users
                                        </div>
                                    </template>
                                </el-statistic>
                                <div class="statistic-footer">
                                    <div class="footer-item">
                                        <span>month on month</span>
                                        <span class="red">
                                            12%
                                            <el-icon>
                                                <CaretBottom/>
                                            </el-icon>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="statistic-card">
                                <el-statistic :value="72000" title="New transactions today">
                                    <template #title>
                                        <div style="display: inline-flex; align-items: center">
                                            New transactions today
                                        </div>
                                    </template>
                                </el-statistic>
                                <div class="statistic-footer">
                                    <div class="footer-item">
                                        <span>than yesterday</span>
                                        <span class="green">
                                            16%
                                            <el-icon>
                                                <CaretTop/>
                                            </el-icon>
                                        </span>
                                    </div>
                                    <div class="footer-item">
                                        <el-icon :size="14">
                                            <ArrowRight/>
                                        </el-icon>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>

</style>
