<script>

import {ElNotification} from "element-plus";
import {call_api} from "../../utils/cloud";
import {date_format} from "../../utils/time";
import {truncate_text} from "@/src/utils/truncate_text";
import AdminView from "@/src/components/admin.vue";

export default {
    name: 'article-admin',
    inheritAttrs: false,
    components: {AdminView},
    data() {
        return {
            article_list: [],
            pages: 0,
            current_page: 1,
            active_name: "all",
            loading: false
        }
    },
    async mounted() {
        await this.get_article_list();
    },
    methods: {
        truncate_text,
        async get_article_list() {
            this.loading = true;

            this.pages += 1;
            let start_time = new Date().getTime();
            let skip_number = 0;
            if (this.pages > 1) {
                start_time = this.article_list[this.pages - 2][this.article_list[this.pages - 2].length - 1].create_at;
                skip_number = this.skip_number()
            }
            let res = await call_api("article/get_all_articles_admin", {
                time_range: {
                    from_time: start_time,
                    to_time: 0
                },
                article_number: 20,
                skip_number,
                type: "all"
            });

            if (!res.success) {
                if (res.code === "err_no_token") {
                    ElNotification({
                        title: 'Error',
                        message: '请检查您的登陆状态',
                        type: 'error',
                    })
                } else {
                    ElNotification({
                        title: 'Error',
                        message: '获取文章失败',
                        type: 'error',
                    });
                }
                this.pages -= 1;
                return;
            }
            console.log(res.data)

            this.article_list = this.article_list.concat([await this.articles_format(res.data.articles)]);


            this.loading = false;
        },
        async articles_format(articles) {
            if (!articles) {
                return [];
            }

            return await Promise.all(articles.map((article) => {
                return new Promise((resolve) => {
                    article.user.avatar_filename = article.user.avatar + ".jpg"
                    article.create_at_format_str = date_format(new Date(article.create_at));
                    const regex = /#|\*|https:\/\/\S+/g;
                    article.content = article.content.replace(regex, '');
                    article.content = truncate_text(article.content, 200);
                    resolve(article);
                })
            }));
        },
        skip_number() {
            let index = 1;
            while (this.article_list[this.pages - 2][this.article_list[this.pages - 2].length - index].create_at === this.article_list[this.pages - 2][this.article_list[this.pages - 2].length - index - 1].create_at) {
                index += 1;
            }
            return index;
        },
        async change_article_public_state(id, article_id, public_state) {
            console.log(public_state);
            let res = await call_api("article/change_article_public_state", {
                article_id: article_id,
                public_state: public_state
            });

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    message: '修改成功',
                    type: 'success',
                });
                this.article_list[this.current_page - 1][id].public_state = public_state;
            } else {
                ElNotification({
                    title: 'Error',
                    message: res,
                    type: 'error',
                });
            }

        },
        async delete_article(article_id) {
            let res = await call_api("article/delete_article", {
                article_id: article_id
            });

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    message: '删除成功',
                    type: 'success',
                });
                this.article_list[this.current_page - 1] = this.article_list[this.current_page - 1].filter((article) => article.id !== article_id);
            } else {
                ElNotification({
                    title: 'Error',
                    message: res,
                    type: 'error',
                });
            }
        },
        row_dblclick(row) {
            this.$router.push(`/article/read?article_id=${row.id}`);
        },
        switch_tab() {
            this.article_list = [];
            this.pages = 0;
            this.current_page = 1;
            this.get_article_list();
        },
        async change() {
            if (this.pages + 1 === this.current_page) {
                await this.get_article_list()
            }

        },
        page_count() {
            return this.article_list[this.pages - 1]?.length === 20 ? this.pages + 1 : this.pages
        },
        update_article(id) {
            this.$router.push(`/admin/article/write?article_id=${id}`)
        }
    },
}
</script>

<template>
    <admin-view>
        <div class="w-full h-[95vh] bg-[#F8FAFD] flex flex-col content-center items-center">
            <el-tabs v-model="active_name" v-loading="loading" class="w-[95%]" @tab-change="switch_tab">
                <el-tab-pane label="全部" name="all">
                    <div class="w-full">
                        <el-table :data="article_list[current_page - 1]"
                                  :row-style="(row) => {return row.row.public_state ? '--el-table-tr-bg-color: var(--el-color-success-light-9)' : '--el-table-tr-bg-color: var(--el-color-warning-light-9)'}"
                                  border
                                  max-height="80vh"
                                  style="width: 100%"
                                  @row-dblclick="(row) => row_dblclick(row)">
                            <el-table-column type="expand">
                                <template #default="props">
                                    <div class="px-[10px]">
                                        {{ props.row.content }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column type="index" width="50"/>
                            <el-table-column label="文章id" prop="id" width="100"/>
                            <el-table-column label="标题" prop="title"/>
                            <el-table-column :formatter="(row) => {return row.public_state ? '公开' : '私有'}"
                                             label="公开状态"
                                             prop="public_state"
                                             width="100"/>
                            <el-table-column label="发布者" prop="user.name" width="100"/>
                            <el-table-column label="发布者id" prop="user.id" width="100"/>
                            <el-table-column label="发布时间" prop="create_at_format_str" width="200"/>
                            <el-table-column label="操作" width="250">
                                <template #header>
                                    <el-button class="w-full" type="primary"
                                               @click="this.$router.push('/admin/article/write')">
                                        发布新文章
                                    </el-button>
                                </template>
                                <template #default="scope">
                                    <el-button
                                        size="small"
                                        type="info"
                                        @click="update_article(scope.row.id)"
                                    >
                                        编辑
                                    </el-button>
                                    <el-button
                                        size="small"
                                        type="primary"
                                        @click="change_article_public_state(scope.$index, scope.row.id, true)"
                                    >
                                        公开
                                    </el-button>
                                    <el-button
                                        size="small"
                                        @click="change_article_public_state(scope.$index, scope.row.id, false)"
                                    >
                                        私有
                                    </el-button>
                                    <el-button
                                        size="small"
                                        type="danger"
                                        @click="delete_article(scope.row.id)"
                                    >
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-pagination v-model:current-page="current_page" :page-count="page_count()"
                                       layout="prev, pager, next" @change="change()"/>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </admin-view>

</template>

<style scoped>
</style>
