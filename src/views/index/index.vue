<script>

import {call_api} from "@/src/utils/cloud";

export default {
    data() {
        return {
            picture_url: [
                "/static/picture/1.jpg",
                "/static/picture/2.jpg"
            ],
            online_tools: []
        };
    },
    mounted() {
        this.get_online_tools();
    },
    methods: {
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
                                <el-button v-for="tool in online_tools"
                                           @click="this.$router.push(`/intermediate?url=${tool.url}`)">
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
    </div>
</template>

<style scoped>
.el-carousel {
    height: 100%;
}
</style>
