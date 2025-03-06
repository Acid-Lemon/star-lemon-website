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
    <div class="bg-[url('/static/background/22.jpg')] bg-cover bg-center w-full h-full pt-[100px]">
        <div class="flex flex-col">
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
                <svg fill="rgba(0,0,0,1)" height="20px" viewBox="0 0 24 24" width="20px"
                     xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.9998 3.29814L14.4451 1.66794L15.5545 3.33204L12.9998 5.03517V10.2678L17.5313 7.65149L17.7289 4.58748L19.7247 4.7162L19.5356 7.64899L22.17 8.95159L21.2836 10.7444L18.5313 9.38354L14.0001 11.9996L18.5317 14.616L21.284 13.2551L22.1704 15.0479L19.536 16.3505L19.7251 19.2833L17.7293 19.412L17.5317 16.348L12.9998 13.7315V18.9648L15.5545 20.6679L14.4451 22.332L11.9998 20.7018L9.55446 22.332L8.44506 20.6679L10.9998 18.9648V13.7319L6.46786 16.3484L6.27026 19.4124L4.2744 19.2836L4.46355 16.3508L1.8291 15.0483L2.71555 13.2554L5.46786 14.6163L10.0001 11.9996L5.46824 9.38319L2.71594 10.7441L1.82948 8.95124L4.46393 7.64864L4.27478 4.71585L6.27064 4.58713L6.46824 7.65113L10.9998 10.2674V5.03517L8.44506 3.33204L9.55446 1.66794L11.9998 3.29814Z"></path>
                </svg>
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
    </div>
</template>

<style scoped>
</style>
