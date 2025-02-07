<script>
import {ArrowLeft, CaretTop} from "@element-plus/icons-vue";
import {call_api} from "../../utils/cloud";
import {ElNotification} from "element-plus";
import {date_format} from "../../utils/time";
import MdParser from "../../components/md-parser.vue";

export default {
    name: 'NoteView',
    components: {MdParser, CaretTop, ArrowLeft},
    data() {
        return {
            article: {},
            loading: false,
            scrollPercentage: 0,
        }
    },
    async mounted() {
        this.loading = true;
        await this.get_article();
        this.loading = false;
    },
    methods: {
        async get_article() {
            console.log(this.$route.query.article_id);
            let res = await call_api("article/get_article", {
                article_id: this.$route.query.article_id
            })

            if (!res.success) {
                ElNotification({
                    title: 'Error',
                    message: '加载文章失败',
                    type: 'error',
                });
            }

            this.article = await this.article_format(res.data);
            console.log(this.article)
        },
        async article_format(article) {
            article.create_at_format_str = date_format(new Date(article.create_at));
            return article
        },
        handle_scroll(distance) {
            const scrollHeight = this.$refs["el-scrollbar"].wrapRef.scrollHeight - this.$refs["el-scrollbar"].wrapRef.offsetHeight;
            this.scrollPercentage = Math.round((distance.scrollTop / scrollHeight) * 100);
        },
        back_top() {
            this.$refs["el-scrollbar"].wrapRef.scrollTop = 0;
        },
        on_back() {
            if (window.history.length > 1) {
                this.$router.back()
            } else {
                this.$router.push('/article');
            }
        },
    },
}
</script>

<template>
    <div v-loading="this.loading" class="w-full h-full">
        <div class="w-full h-[6vh] fixed top-0 left-0 p-[10px] z-[1000] flex flex-row items-center">
            <div class="flex flex-row items-center text-[#FFFFFF] font-['SYST']" @click="on_back">
                <el-icon style="width: 25px; height: 25px">
                    <arrow-left style="width: 25px; height: 25px"/>
                </el-icon>
                返回
            </div>
            <div class="w-[1px] h-[80%] border border-[#FFFFFF] mx-[10px]"></div>
            <div class="text-[2vh] text-[#FFFFFF] font-['SYST']">文章</div>
        </div>
        <div class="h-full w-full flex flex-col items-center justify-start">
            <el-scrollbar ref="el-scrollbar" @scroll="handle_scroll">
                <div
                    class="w-full min-h-[40vh] bg-[url('/static/background/23.jpg')] flex flex-col justify-center items-center bg-center bg-cover">
                    <p class="text-[#FFFFFF] font-['SYST'] text-[3.6vh] hover:text-[#44cef6] duration-700"
                       style="text-shadow: 1px 1px 2px black">
                        {{ article?.title }}
                    </p>
                    <div class="flex flex-row items-center justify-center mb-[5px]">
                        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px]"
                             style="text-shadow: 1px 1px 2px black">
                            {{ article?.user?.name }}
                        </div>
                        <svg class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" viewBox="0 0 24 24">
                            <path
                                d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5Z"
                                fill="currentColor"></path>
                        </svg>
                        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50"
                             style="text-shadow: 1px 1px 2px black">
                            {{ article?.create_at_format_str }}
                        </div>
                        <img alt="浏览" class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/views.svg"/>
                        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50"
                             style="text-shadow: 1px 1px 2px black">
                            {{ article?.views?.num }}
                        </div>
                        <img alt="喜欢" class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/likes.svg"/>
                        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50"
                             style="text-shadow: 1px 1px 2px black">
                            {{ article?.likes?.num }}
                        </div>
                        <img alt="评论" class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/comments.svg"/>
                        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] opacity-50"
                             style="text-shadow: 1px 1px 2px black">
                            {{ article?.comments?.num }}
                        </div>
                    </div>
                </div>
                <div class="w-full min-h-[60vh] flex flex-row items-start justify-center bg-[#F8FAFD]">
                    <div class="w-[15vw] flex flex-col items-center justify-start"></div>
                    <div class="w-[70vw] flex flex-col items-center justify-start">
                        <div class="w-[70vw] min-h-[60vh] my-[20px] bg-white shadow-md p-[20px]">
                            <md-parser :content=article?.content></md-parser>
                        </div>
                    </div>
                    <div class="w-[15vw] flex flex-col items-start justify-start">
                        <el-affix :offset="5">
                            <div class="p-[20px]">
                                <div id="outline" class="text-[1.8vh] my-[5px] font-['SYST']"></div>
                                <el-divider/>
                                <div class="flex flex-row items-center justify-start">
                                    <svg height="1.5vh" viewBox="0 0 24 24" width="1.5vh"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 22q-2.05 0-3.875-.788t-3.187-2.15q-1.363-1.362-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175Q6.3 3.575 8.124 2.788T12 2q.425 0 .713.288T13 3q0 .425-.288.713T12 4Q8.675 4 6.337 6.338T4 12q0 3.325 2.338 5.663T12 20q3.325 0 5.663-2.337T20 12q0-.425.288-.712T21 11q.425 0 .713.288T22 12q0 2.05-.788 3.875t-2.15 3.188q-1.362 1.362-3.175 2.15T12 22"
                                            fill="currentColor"></path>
                                    </svg>
                                    <div class="m-[3px] text-[1.5vh] font-['SYST']">{{ scrollPercentage }}%</div>
                                </div>
                            </div>
                        </el-affix>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div v-if="scrollPercentage > 20"
             class="fixed bottom-[40px] right-[40px] w-[40px] h-[40px] border-[2px] border-[#000000] rounded-full flex flex-row justify-center items-center"
             @click="back_top">
            <el-icon style="width: 20px; height: 20px">
                <CaretTop style="width: 20px; height: 20px"/>
            </el-icon>
        </div>
    </div>

</template>

<style scoped>
</style>
