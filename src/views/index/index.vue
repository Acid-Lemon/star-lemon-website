<script>

import {call_api} from "@/src/utils/cloud";
import snowflake from "@/src/components/snowflake.vue";

export default {
    components: {snowflake},
    data() {
        return {
            picture_url: [
                "/static/picture/1.jpg",
                "/static/picture/2.jpg"
            ],
            online_tools: [],
            snow_switch: false,
            snowflakes: [],
        };
    },
    mounted() {
        this.get_online_tools();
        this.generateSnowflakes(300);
    },
    methods: {
        generateSnowflakes(count) {
            for (let i = 0; i < count; i++) {
                this.snowflakes.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * -window.innerHeight,
                    size: Math.random() * 5 + 2, // 雪花大小在2px到7px之间
                    opacity: Math.random() * 0.5 + 0.5, // 透明度在0.5到1之间
                    duration: Math.random() * 5 + 5, // 下落速度在5s到10s之间
                });
            }
        },

        async get_online_tools() {
            if (!window.sessionStorage.getItem("online_tools")) {
                let res = await call_api("online_tools/get_online_tools");

                if (!res.success) {
                    return;
                }

                window.sessionStorage.setItem("online_tools", JSON.stringify(res.data));
                this.online_tools = this.online_tools.concat(res.data.tools);
            } else {
                this.online_tools = JSON.parse(window.sessionStorage.getItem("online_tools")).tools;
            }
        },

        open_url(url) {
            window.open(url, "_blank");
        }
    },
};
</script>

<template>
    <div class="bg-[url('/static/background/4.png')] bg-cover bg-center w-full h-full pt-[100px]">
        <el-scrollbar>
            <div class="flex flex-col mb-[80px] md:mb-[40px]">
                <uni-notice-bar background-color="#FFFFFF" scrollable show-icon
                                text="欢迎来到star和lemon的小站!~ 我们网站将不断迭代, 为大家提供更多功能, 让大家在这个互联网的时代, 体验到更多科技带来的便捷与乐趣!"/>
                <div class="flex flex-row">
                    <div class="flex flex-row mt-[20px]">
                        <div class="flex flex-col">
                            <div class="sm:w-[500px] w-[90vw] sm:h-[280px] h-[50vw] sm:ml-[20px] ml-[5vw]">
                                <el-carousel motion-blur trigger="click">
                                    <el-carousel-item v-for="picture in picture_url" :key="picture">
                                        <el-image :src="picture" fit="cover"/>
                                    </el-carousel-item>
                                </el-carousel>
                            </div>
                            <div class="sm:w-[500px] w-[90vw] ml-[20px] mt-[20px]">
                                <el-card style="max-width: 500px">
                                    <template #header>
                                        <div class="card-header">
                                            <span>实用功能</span>
                                        </div>
                                    </template>
                                    <el-button @click="this.$router.push('/useful_tools/separate_audio')">
                                        视频音频分离
                                    </el-button>
                                    <el-button @click="this.$router.push('/useful_tools/quick_file_transfer')">
                                        文件快传
                                    </el-button>
                                </el-card>
                            </div>
                            <div class="sm:w-[500px] w-[90vw] ml-[20px] mt-[20px]">
                                <el-card style="max-width: 500px">
                                    <template #header>
                                        <div class="card-header">
                                            <span>在线小工具</span>
                                            <span class="text-[#88888888]">（来源于外部网站）</span>
                                        </div>
                                    </template>
                                    <el-button v-for="tool in online_tools" @click="open_url(tool.url)">
                                        {{ tool.name }}
                                    </el-button>
                                </el-card>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row mt-[20px]">
                        <div class="flex flex-col">
                            <div class="md:w-[500px] w-[90vw] md:h-[280px] h-[50vw] md:ml-[20px] ml-[5vw]">
                            </div>
                            <div class="w-[500px] ml-[20px] mt-[20px]">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fixed top-[20vh] right-[30px] w-[20px] h-[20px]">
                <el-button class="w-full h-full" round @click="snow_switch = !snow_switch">
                    <i class="ri-snowflake-line"></i>
                </el-button>
            </div>
            <snowflake
                v-for="(snowflake, index) in snowflakes"
                v-if="snow_switch"
                :key="index"
                :duration="snowflake.duration"
                :opacity="snowflake.opacity"
                :size="snowflake.size"
                :x="snowflake.x"
                :y="snowflake.y"
            />
        </el-scrollbar>
    </div>
</template>

<style scoped>
</style>
