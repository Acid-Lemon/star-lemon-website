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
        '$route.query.type'() {
            this.pages = 0;
            this.article_list = [];
            this.has_more = true;
            this.get_article_list();
        }
    },
    computed: {
        state() {
            return !this.has_more || this.loading_more
        },
    },
    methods: {
        truncate_text,
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
            });

            if (!res.success) {
                this.pages -= 1;
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
    },
}
</script>

<template>
    <el-scrollbar>
        <div class="w-full h-full flex flex-col items-center justify-start">
            <div
                class="w-full md:min-h-[40vh] min-h-[30vh] bg-[url('/static/background/13.jpg')] flex flex-row justify-center items-center bg-center bg-cover">
                <p class="text-[#FFFFFF] font-['FZSX'] text-[6vh] hover:text-[#44cef6] duration-700">
                    文章
                </p>
            </div>
            <div class="w-full md:min-h-[60vh] min-h-[70vh] flex flex-col items-center justify-start">
                <div
                    v-infinite-scroll="get_article_list"
                    :infinite-scroll-disabled="state"
                    class="md:w-[70vw] w-[90vw] h-auto bg-[#FFFFFF] shadow-md mt-[20px]"
                    infinite-scroll-delay=1000 infinite-scroll-distance=100>
                    <div v-for="article in article_list">
                        <router-link :to="'/article/read' + '?article_id=' + article.id">
                            <div class="w-full h-auto px-[20px] py-[20px] border-b border-[#000000]">
                                <div class="text-[2.6vh] font-['SYST']">{{ article.title }}</div>
                                <div
                                    class="flex md:flex-row flex-col md:items-center md:justify-start items-start justify-center mb-[5px]">
                                    <div class="flex flex-row items-center">
                                        <div class="text-[1.5vh] font-['SYST'] mr-[20px]">{{ article.user.name }}</div>
                                        <svg class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]" viewBox="0 0 24 24">
                                            <path
                                                d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5Z"
                                                fill="currentColor"></path>
                                        </svg>
                                        <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">{{
                                                article.create_at_format_str
                                            }}
                                        </div>
                                    </div>
                                    <div class="flex flex-row items-center">
                                        <img alt="浏览" class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                             src="/static/svg/views.svg"/>
                                        <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">{{
                                                article.views.num
                                            }}
                                        </div>
                                        <img alt="喜欢" class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                             src="/static/svg/likes.svg"/>
                                        <div class="text-[1.5vh] font-['SYST'] mr-[20px] opacity-50">{{
                                                article.likes.num
                                            }}
                                        </div>
                                        <img alt="评论"
                                             class="opacity-50 w-[1.5vh] h-[1.5vh] mr-[3px]"
                                             src="/static/svg/comments.svg"/>
                                        <div class="text-[1.5vh] font-['SYST'] opacity-50">{{
                                                article.comments.num
                                            }}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-[1.5vh] font-['SYST']">{{ article.content }}</div>
                            </div>
                        </router-link>
                    </div>
                </div>
                <div class="md:w-[70vw] w-[90vw] h-[100px] flex flex-row items-center justify-center">
                    <div v-if="loading_more" class="text-[3vh] font-['RGBZ']">正在加载中</div>
                    <div v-if="!this.has_more"
                         class="text-[3vh] font-['RGBZ']">没有更多文章惹
                    </div>
                </div>
            </div>
        </div>
    </el-scrollbar>
</template>

<style scoped>
</style>
