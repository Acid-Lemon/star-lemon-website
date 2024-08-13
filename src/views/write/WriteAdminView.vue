<script>

import MyEditor from "../../components/MyEditor.vue";

export default {
    name: 'ArticleAdminView',
    components: {MyEditor},
    data() {
        return {
            value: '',

        }
    },
    methods: {
        release_article() {
            console.log(this.value)
        },

    }
}
</script>

<template>
    <admin-view>
        <div class="h-full w-full bg-[#F8FAFD] flex flex-col justify-center items-center">
            <div class="w-full h-[5vh] flex flex-row items-center justify-around">
                <div class="flex flex-row">
                    <p>文章标题：</p>
                    <el-Input style="width: auto;height: 30px"></el-Input>
                </div>
                <div class="flex flex-row">
                    <p>文章简介：</p>
                    <el-Input style="width: auto;height: 30px"></el-Input>
                </div>
                <div class="flex flex-row">
                    <p>文章封面：</p>
                    <el-Input placeholder="请输入一个图片链接" style="width: auto;height: 30px"></el-Input>
                </div>
                <el-button type="primary" @click="release_article()">发布</el-button>
            </div>
            <div class="w-[70vw]">
                <my-editor @update:model-value="(editor_value) => this.value = editor_value"></my-editor>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>
</style>
