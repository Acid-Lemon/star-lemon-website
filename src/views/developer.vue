<script>
export default {
    data() {
        return {
            developers: [
                {
                    name: "star",
                    avatar: "/static/developer/1.jpg",
                    say: "诶嘿～",
                    contact: [
                        {
                            name: "github",
                            link: "https://github.com/star-starry-sea"
                        },
                        {
                            name: "bilibili",
                            link: "https://space.bilibili.com/25124707",
                        }
                    ]
                }, {
                    name: "lemon",
                    avatar: "/static/developer/2.jpg",
                    say: "大家好！我是lemon，一位普普通通的少年。喜欢编程，喜欢摄影，喜欢音乐，喜欢记录生活。",
                    contact: [
                        {
                            name: "github",
                            svg: "/static/svg/github.svg",
                            link: "https://github.com/Acid-Lemon"
                        },
                        {
                            name: "bilibili",
                            svg: "/static/svg/哔哩哔哩.svg",
                            link: "https://space.bilibili.com/400932209",
                        }
                    ]
                }
            ],
            power: [
                {
                    name: "html",
                    svg: "/static/svg/html.svg",
                }, {
                    name: "css",
                    svg: "/static/svg/css.svg",
                }, {
                    name: "javascript",
                    svg: "/static/svg/javascript.svg",
                }, {
                    name: "Vue",
                    svg: "/static/svg/Vue.svg",
                }, {
                    name: "element-UI",
                    svg: "/static/svg/element-UI.svg",
                }, {
                    name: "tailwind-css",
                    svg: "/static/svg/tailwind-css.svg",
                }, {
                    name: "pinia",
                    svg: "/static/svg/pinia.svg",
                }
            ]
        };
    }
};
</script>

<template>
    <div class="w-full h-full flex flex-col px-[20px] bg-[#F8FAFD]">
        <div class="w-full h-[10%]">
        </div>
        <div class="w-full h-[20%]">
            <div class="text-[3vh] font-['SYST'] my-[20px]">
                此网站主要所用到的技术
            </div>
            <div class="flex flex-row my-[20px]">
                <div v-for="i in power" class="flex flex-row">
                    <img :alt="i.name" :src="i.svg" class="w-[5vh] h-[5vh] m-[5px]"/>
                    <img alt="加号" class="w-[5vh] h-[5vh] m-[5px]" src="/static/svg/加号.svg"/>
                </div>
                <img alt="省略号" class="w-[5vh] h-[5vh] m-[5px]" src="/static/svg/省略号.svg"/>
            </div>
        </div>
        <div v-for="(developer, index) in developers" :class="[ index % 2 === 0 ? 'flex-row' : 'flex-row-reverse']"
             class="w-full h-[35%] flex items-center content-center">
            <div class="w-[15%] h-full flex flex-col justify-center items-center">
                <el-avatar :size=120 :src="developer.avatar"
                           alt="头像"
                           class="hover:rotate-[360deg] duration-700 border border-[#dedede]"/>
                <div class="text-[20px] font-['SYST']">{{ developer.name }}</div>
                <div class="flex flex-row content-center items-center">
                    <div v-for="i in developer.contact" class="m-[1vh] flex flex-row content-center items-center">
                        <a :href="i.link" target="_blank">
                            <i :class="'ri-' + i.name + '-fill'" class="ri-2x"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="w-[85%] h-full p-[20px]">
                <div
                    class="w-full h-full bg-[#FFFFFF] rounded-[25px] p-[20px] text-[20px] font-['SYST'] border border-[#dedede] shadow-md">
                    {{ developer.say }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
