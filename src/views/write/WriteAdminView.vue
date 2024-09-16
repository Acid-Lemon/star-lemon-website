<script>

import MyEditor from "../../components/MyEditor.vue";

export default {
    name: 'ArticleAdminView',
    components: {MyEditor},
    data() {
        return {
            editor_value: '',

        }
    },
    methods: {
        release_article() {
            console.log(this.value);
        },
        update_editor_value(value) {
            this.editor_value = value;
        }
    }
}
</script>

<template>
    <admin-view>
        <div class="h-full w-full bg-[#F8FAFD] flex flex-col justify-center items-center">
            <div class="w-full h-[10vh] flex flex-row items-center justify-around">
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
            <div class="w-full h-[90vh] flex flex-col items-center justify-center">
                <my-editor class="w-full h-[50vh]"
                           @update:value="update_editor_value"></my-editor>
                <div class="text-[2.5vh] font-['SYST'] w-full h-[40vh]">{{ editor_value }}</div>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>
</style>
