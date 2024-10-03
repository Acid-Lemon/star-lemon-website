<script>
import {ElNotification} from "element-plus";
import {call_api} from "@/src/utils/cloud";
import {date_format} from "@/src/utils/time";

export default {
    data() {
        return {
            message_list: [],
            pages: 0,
            current_page: 1,
            info: null,
            active_name: "all",
        }
    },
    async mounted() {
        await this.get_messages();
    },
    methods: {
        async get_messages() {
            this.pages += 1;
            let start_time = new Date().getTime();
            let skip_number = 0;
            if (this.pages !== 1) {
                start_time = this.message_list[this.pages - 2][this.message_list[this.pages - 2].length - 1].create_at;
                skip_number = this.skip_number()
            }
            let res = await call_api("message_board/get_all_messages_admin", {
                time_range: {
                    from_time: start_time,
                    to_time: 0
                },
                message_number: 20,
                skip_number,
                type: this.active_name
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
                        message: '获取留言失败',
                        type: 'error',
                    });
                }
                this.pages -= 1;
                return;
            }

            this.message_list = this.message_list.concat([await this.messages_format(res.data.messages)]);
        },
        async messages_format(messages) {
            if (!messages) {
                return [];
            }

            return await Promise.all(messages.map((message) => {
                return new Promise((resolve) => {
                    message.user.avatar_filename = message.user.avatar + ".jpg"
                    message.create_at_format_str = date_format(new Date(message.create_at));
                    resolve(message);
                })
            }));
        },
        async change_message_public_state(id, message_id, public_state) {
            console.log(public_state);
            let res = await call_api("message_board/change_message_public_state", {
                message_id: message_id,
                public_state: public_state
            });

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    message: '修改成功',
                    type: 'success',
                });
                if (this.active_name === "unreviewed") {
                    this.message_list[this.current_page - 1] = this.message_list[this.current_page - 1].filter((message) => message.id !== message_id);
                }
                this.message_list[this.current_page - 1][id].public_state = !this.message_list[this.current_page - 1][id].public_state;
            } else {
                ElNotification({
                    title: 'Error',
                    message: res,
                    type: 'error',
                });
            }

        },
        async delete_message(message_id) {
            let res = await call_api("message_board/delete_message", {
                message_id: message_id
            });

            if (res.success) {
                ElNotification({
                    title: 'Success',
                    message: '删除成功',
                    type: 'success',
                });
                this.message_list[this.current_page - 1] = this.message_list[this.current_page - 1].filter((message) => message.id !== message_id);
            } else {
                ElNotification({
                    title: 'Error',
                    message: res,
                    type: 'error',
                });
            }
        },
        switch_tab() {
            this.message_list = [];
            this.pages = 0;
            this.current_page = 1;
            this.get_messages();
        },
        async change() {
            if (this.pages + 1 === this.current_page) {
                await this.get_messages()
            }

        },
        page_count() {
            return this.message_list[this.pages - 1]?.length === 20 ? this.pages + 1 : this.pages
        },
        skip_number() {
            let index = 1;
            while (this.message_list[this.pages - 2][this.message_list[this.pages - 2].length - index].create_at === this.message_list[this.pages - 2][this.message_list[this.pages - 2].length - index - 1].create_at) {
                index += 1;
            }
            return index;
        },
    },
}
</script>

<template>
    <admin-view>
        <div class="w-full h-[95vh] bg-[#F8FAFD] flex flex-col content-center items-center">
            <el-tabs v-model="active_name" class="w-[95%]" @tab-change="switch_tab">
                <el-tab-pane label="全部" name="all">
                    <div class="w-full">
                        <el-table :data="message_list[current_page - 1]"
                                  :row-style="(row) => {return row.row.public_state ? '--el-table-tr-bg-color: var(--el-color-success-light-9)' : '--el-table-tr-bg-color: var(--el-color-warning-light-9)'}"
                                  border
                                  max-height="80vh"
                                  style="width: 100%">
                            <el-table-column type="index" width="50"/>
                            <el-table-column label="留言id" prop="id" width="250"/>
                            <el-table-column label="内容" prop="content"/>
                            <el-table-column :formatter="(row) => {return row.public_state ? '公开' : '私有'}"
                                             label="公开状态"
                                             prop="public_state"
                                             width="100"/>
                            <el-table-column label="发布者" prop="user.name" width="100"/>
                            <el-table-column label="发布者id" prop="user.id" width="250"/>
                            <el-table-column label="发布时间" prop="create_at_format_str" width="250"/>
                            <el-table-column label="操作" width="200">
                                <template #default="scope">
                                    <el-button
                                        size="small"
                                        type="danger"
                                        @click="delete_message(scope.row.id)"
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
                <el-tab-pane label="未审核" name="unreviewed">
                    <div class="w-full">
                        <el-table :data="message_list[current_page - 1]"
                                  :row-style="(row) => {return row.row.public_state ? '--el-table-tr-bg-color: var(--el-color-success-light-9)' : '--el-table-tr-bg-color: var(--el-color-warning-light-9)'}"
                                  border
                                  max-height="80vh"
                                  style="width: 100%">
                            <el-table-column type="index" width="50"/>
                            <el-table-column label="留言id" prop="id" width="250"/>
                            <el-table-column label="内容" prop="content"/>
                            <el-table-column :formatter="(row) => {return row.public_state ? '公开' : '私有'}"
                                             label="公开状态"
                                             prop="public_state"
                                             width="100"/>
                            <el-table-column label="发布者" prop="user.name" width="100"/>
                            <el-table-column label="发布者id" prop="user.id" width="250"/>
                            <el-table-column label="发布时间" prop="create_at_format_str" width="250"/>
                            <el-table-column label="操作" width="200">
                                <template #default="scope">
                                    <el-button
                                        size="small"
                                        type="primary"
                                        @click="change_message_public_state(scope.$index, scope.row.id, true)"
                                    >
                                        公开
                                    </el-button>
                                    <el-button
                                        size="small"
                                        @click="change_message_public_state(scope.$index, scope.row.id, false)"
                                    >
                                        私有
                                    </el-button>
                                    <el-button
                                        size="small"
                                        type="danger"
                                        @click="delete_message(scope.row.id)"
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
                <el-tab-pane label="已审核" name="reviewed">
                    <div class="w-full">
                        <el-table :data="message_list[current_page - 1]"
                                  :row-style="(row) => {return row.row.public_state ? '--el-table-tr-bg-color: var(--el-color-success-light-9)' : '--el-table-tr-bg-color: var(--el-color-warning-light-9)'}"
                                  border
                                  max-height="80vh"
                                  style="width: 100%">
                            <el-table-column type="index" width="50"/>
                            <el-table-column label="留言id" prop="id" width="250"/>
                            <el-table-column label="内容" prop="content"/>
                            <el-table-column :formatter="(row) => {return row.public_state ? '公开' : '私有'}"
                                             label="公开状态"
                                             prop="public_state"
                                             width="100"/>
                            <el-table-column label="发布者" prop="user.name" width="100"/>
                            <el-table-column label="发布者id" prop="user.id" width="250"/>
                            <el-table-column label="发布时间" prop="create_at_format_str" width="250"/>
                            <el-table-column label="操作" width="200">
                                <template #default="scope">
                                    <el-button
                                        size="small"
                                        type="primary"
                                        @click="change_message_public_state(scope.$index, scope.row.id, true)"
                                    >
                                        公开
                                    </el-button>
                                    <el-button
                                        size="small"
                                        @click="change_message_public_state(scope.$index, scope.row.id, false)"
                                    >
                                        私有
                                    </el-button>
                                    <el-button
                                        size="small"
                                        type="danger"
                                        @click="delete_message(scope.row.id)"
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