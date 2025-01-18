<script>

import MdEditor from "../../components/md-editor.vue";
import {ElNotification} from "element-plus";
import AdminView from "@/src/components/admin.vue";
import article from "@/src/views/article/article.vue";
import {call_api} from "@/src/utils/cloud";

export default {
    name: 'ArticleAdminView',
    computed: {
        article() {
            return article
        }
    },
    components: {AdminView, MdEditor},
    data() {
        return {
            article: {
                title: '',
                content: '',
                type: 'note'
            },
            rules: {
                title: [
                    {required: true, message: '请输入标题', trigger: 'blur'}
                ],
                content: [
                    {required: true, message: '请输入内容', trigger: 'blur'}
                ],
                type: [
                    {required: true, trigger: 'blur'}
                ]
            },
            types: [{
                label: "笔记",
                value: "note"
            }, {
                label: "日记",
                value: 'diary'
            }, {
                label: "句子",
                value: 'sentence'
            }, {
                label: "其他",
                value: 'other'
            }],
            type: null
        }
    },
    methods: {
        async release_article() {
            const is_valid = await new Promise((resolve) => {
                this.$refs.article_form.validate(valid => {
                    resolve(valid);
                })
            });
            console.log(is_valid);
            if (!is_valid) {
                ElNotification({
                    title: 'Error',
                    message: '请填写完整信息',
                    type: 'error',
                });
                return;
            }
            let res = await call_api("article/create_article", {
                title: this.article.title,
                content: this.article.content,
                type: this.article.type
            })

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    message: '发布成功',
                    type: 'success',
                });
            } else {
                ElNotification({
                    title: 'Error',
                    message: res,
                    type: 'error',
                });
            }
        }
    }
}
</script>

<template>
    <admin-view>
        <div class="h-full w-full bg-[#F8FAFD] flex flex-col justify-center items-center">
            <el-form ref="article_form" :model="article" :rules="rules" class="w-full h-[95vh]">
                <div class="w-full h-[10vh] flex flex-row items-center justify-around">
                    <el-form-item label="标题" prop="title">
                        <el-Input v-model="article.title" style="width: auto;height: 30px"></el-Input>
                    </el-form-item>
                    <el-form-item label="文章类型：" prop="title">
                        <el-select
                            v-model="article.type"
                            placeholder="文章类型"
                            style="width: 100px;height: 30px"
                        >
                            <el-option
                                v-for="type in types"
                                :key="type.value"
                                :label="type.label"
                                :value="type.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="this.$router.back()">返回</el-button>
                        <el-button type="primary" @click="release_article()">发布</el-button>
                    </el-form-item>
                </div>
                <div class="w-full h-[85vh] flex flex-col items-center justify-center">
                    <el-form-item class="w-full h-full mb-0" prop="content">
                        <md-editor class="w-full h-full"
                                   @update:value="value => this.article.content = value"></md-editor>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </admin-view>
</template>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
