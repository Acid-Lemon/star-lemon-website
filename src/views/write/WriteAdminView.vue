<script>

import MdEditor from "../../components/MdEditor.vue";
import {call_api} from "../../utils/cloud";
import {ElNotification} from "element-plus";
import AdminView from "@/src/components/AdminView.vue";

export default {
    name: 'ArticleAdminView',
    components: {AdminView, MdEditor},
    data() {
        return {
            title: '',
            editor_value: '',
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
            let res = await call_api("article/create_article", {
                title: this.title,
                content: this.editor_value,
                type: this.type
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
                <div class="flex flex-row items-center">
                    <p>文章标题：</p>
                    <el-Input v-model="title" style="width: auto;height: 30px"></el-Input>
                </div>
                <div class="flex flex-row items-center">
                    <p>文章类型：</p>
                    <el-select
                        v-model="type"
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
                </div>
                <div class="flex flex-row items-center">
                    <el-button @click="this.$router.back()">返回</el-button>
                    <el-button type="primary" @click="release_article()">发布</el-button>
                </div>
            </div>
            <div class="w-full h-[90vh] flex flex-col items-center justify-center">
                <md-editor class="w-full h-full"
                           @update:value="update_editor_value"></md-editor>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>
</style>
