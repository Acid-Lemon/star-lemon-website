<script>
import {truncate_text} from "@/src/utils/truncate_text";
import {call_api} from "../../utils/cloud";
import {date_format} from "../../utils/time";

export default {
    name: 'ArticleView',
    components: {},
    data() {
        return {
            pages: 0,
            article_list: [],
            loading_more: false,
            has_more: true,
        }
    },
    async mounted() {
        await this.get_article_list();
    },
    watch: {
        '$route.query.type': {
            handler() {
                this.pages = 0;
                this.article_list = [];
                this.has_more = true;
                this.get_article_list();
            },
            deep: true // 启用深度监听
        }
    },
    computed: {
        state() {
            return !this.has_more || this.loading_more
        },
    },
    methods: {
        async get_article_list() {
            this.loading_more = true;

            this.pages += 1;
            let start_time = new Date().getTime();
            let skip_number = 0;
            if (this.pages > 1) {
                start_time = this.article_list[this.article_list.length - 1].create_at;
                skip_number = this.skip_number();
            }
            let res = await call_api("article/get_personal_and_public_articles", {
                time_range: {
                    from_time: start_time,
                    to_time: 0
                },
                article_number: 20,
                skip_number,
                type: this.$route.query.type
            });

            if (!res.success) {
                this.pages -= 1;
                this.loading_more = false;
                return;
            }

            this.article_list = this.article_list.concat(await this.articles_format(res.data.articles));

            this.loading_more = false;
            this.has_more = res.data.articles.length === 20;
        },
        async articles_format(articles) {
            if (!articles) {
                return [];
            }

            return await Promise.all(articles.map((article) => {
                return new Promise(async (resolve) => {
                    article.user.avatar_filename = article.user.avatar + ".jpg"
                    article.create_at_format_str = date_format(new Date(article.create_at));
                    const regex = /#|\*|https:\/\/\S+/g;
                    article.content = article.content.replace(regex, '');
                    article.content = truncate_text(article.content, 300);
                    resolve(article);
                })
            }));
        },
        skip_number() {
            let index = 1;
            while (this.article_list[this.article_list.length - index].create_at === this.article_list[this.article_list.length - index - 1].create_at) {
                index += 1;
            }
            return index;
        },
        // 在元素进入之前设置初始状态
        beforeEnter(el) {
            el.classList.add('opacity-0', 'translate-y-[70vh]');
        },
        // 在元素进入时应用动画
        enter(el, done) {
            const delay = el.dataset.index * 100; // 每个元素的延迟时间（100ms * index）
            console.log(el.dataset.index);
            setTimeout(() => {
                el.classList.remove('opacity-0', 'translate-y-[70vh]');
                el.classList.add('opacity-100', 'translate-y-0');
                done(); // 通知 Vue 动画完成
            }, delay);
        },
    },
}
</script>

<template>
    <el-scrollbar>
        <div class="w-full h-full flex flex-col items-center justify-start">
            <div
                class="w-full md:min-h-[40vh] min-h-[30vh] bg-[url('/static/background/13.jpg')] flex flex-row justify-center items-center bg-center bg-cover">
                <p class="text-[#FFFFFF] font-['SYST'] text-[6vh] hover:text-[#44cef6] duration-700">
                    文章
                </p>
            </div>
            <div class="w-full md:min-h-[60vh] min-h-[70vh] flex flex-col items-center justify-start">
                <div
                    v-infinite-scroll="get_article_list"
                    :infinite-scroll-disabled="state"
                    class="md:w-[70vw] w-[90vw] h-auto bg-[#FFFFFF] shadow-md mt-[20px]"
                    infinite-scroll-delay=1000 infinite-scroll-distance=100>
                    <transition-group name="fade"
                                      tag="div"
                                      @enter="enter"
                                      @before-enter="beforeEnter">
                        <div v-for="(article, index) in article_list" :key="article.id" :data-index="index"
                             class="relative w-full h-auto px-[20px] py-[20px] hover:shadow-md bg-white hover:bg-[#F5F5F5] z-0 hover:z-10 hover:scale-[1.02] ease-in-out transition duration-300"
                             @click="this.$router.push(`/article/read?article_id=${article.id}`)">
                            <div class="text-[2.6vh] font-['SYST'] font-bold">{{ article.title }}</div>
                            <div
                                class="flex md:flex-row flex-col md:items-center md:justify-start items-start justify-center mb-[5px]">
                                <div class="flex flex-row items-center">
                                    <div class="text-[1.5vh] font-['SYST'] mr-[20px]">{{ article.user.name }}</div>
                                    <svg class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]" viewBox="0 0 24 24">
                                        <path
                                            d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5Z"
                                            fill="currentColor">
                                        </path>
                                    </svg>
                                    <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">
                                        {{ article.create_at_format_str }}
                                    </div>
                                </div>
                                <div class="flex flex-row items-center">
                                    <img alt="浏览" class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                         src="/static/svg/views.svg"/>
                                    <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">
                                        {{ article.views.num }}
                                    </div>
                                    <img alt="喜欢" class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                         src="/static/svg/likes.svg"/>
                                    <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">
                                        {{ article.likes.num }}
                                    </div>
                                    <img alt="评论"
                                         class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                         src="/static/svg/comments.svg"/>
                                    <div class="text-[1.5vh] font-['SYST'] opacity-50">
                                        {{ article.comments.num }}
                                    </div>
                                </div>
                            </div>
                            <div class="text-[1.5vh] font-['SYST']">{{ article.content }}</div>
                        </div>
                    </transition-group>
                </div>
                <div class="md:w-[70vw] w-[90vw] h-[100px] flex flex-row items-center justify-center">
                    <div v-if="loading_more" class="text-[3vh] font-['SYST']">正在加载中</div>
                    <div v-if="!this.has_more"
                         class="text-[3vh] font-['SYST']">没有更多文章惹
                    </div>
                </div>
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
</style>
