<script>
import {ElNotification} from "element-plus";
import AdminView from "@/src/components/admin.vue";
import {call_api} from "@/src/utils/cloud";
import {date_format} from "@/src/utils/time";
import {use_user_info_store} from "@/src/stores/userInfo";

export default {
    name: "online-tools-admin",
    inheritAttrs: false,
    components: {
        AdminView,
    },
    data() {
        return {
            tool: {
                name: "",
                url: ""
            },
            tools: [],
            disabled: {
                add: false,
                delete: false
            },
            dialog_visible: {
                add: false
            }
        };
    },
    computed: {
        user_info() {
            const user_infoStore = use_user_info_store();
            return user_infoStore.user_info;
        },
    },
    async mounted() {
        await this.get_online_tools();
    },
    methods: {
        async tools_format(tools) {
            if (!tools) {
                return [];
            }

            return await Promise.all(tools.map((tool) => {
                return new Promise(async (resolve) => {
                    tool.create_at_format_str = date_format(new Date(tool.create_at));
                    resolve(tool);
                })
            }));
        },
        async get_online_tools() {
            let res = await call_api("online_tools/get_online_tools");

            if (!res.success) {
                return;
            }

            this.tools = this.tools.concat(await this.tools_format(res.data.tools));
        },
        async add_tool() {
            this.disabled.add = true;

            let res = await call_api("online_tools/add_online_tool", {
                name: this.tool.name,
                url: this.tool.url
            })

            if (!res.success) {
                this.disabled.add = false;
                return;
            }

            this.tools = this.tools.concat({
                id: res.data.id,
                name: this.tool.name,
                url: this.tool.url,
                user: {
                    name: this.user_info.name,
                    user_id: this.user_info.id,
                },
                create_at: res.data.create_at,
            })

            this.tool = {
                name: "",
                url: ""
            }

            ElNotification({
                title: "Success",
                message: "添加成功",
                type: "success"
            })

            this.disabled.add = false;
        },
        async delete_tool(tool_id) {
            this.disabled.delete = true;

            let res = await call_api("online_tools/delete_online_tool", {
                tool_id: tool_id
            })

            if (!res.success) {
                this.disabled.delete = false;
                return;
            }

            ElNotification({
                title: "Success",
                message: "删除成功",
                type: "success"
            })

            this.tools = this.tools.filter((tool) => tool.id !== tool_id);

            this.disabled.delete = false;
        },
        cancel_add() {
            this.tool = {
                name: "",
                url: ""
            }

            this.dialog_visible.add = false;
        }
    }
};
</script>

<template>
    <admin-view>
        <div class="w-full [95vh] bg-[#F8FAFD] flex flex-col items-center mt-[3vh]">
            <div class="w-[95%] h-[85vh]">
                <el-table :data="tools"
                          border
                          max-height="80vh"
                          style="width: 100%">
                    <el-table-column type="index" width="50"/>
                    <el-table-column label="工具id" prop="id" width="100"/>
                    <el-table-column label="工具名称" prop="name"/>
                    <el-table-column label="工具链接" prop="url"/>
                    <el-table-column label="添加者" prop="user.name" width="100"/>
                    <el-table-column label="添加者id" prop="user.id" width="100"/>
                    <el-table-column label="添加时间" prop="create_at_format_str" width="200"/>
                    <el-table-column align="center" label="操作" width="100">
                        <template #header>
                            <el-button class="w-full" type="primary" @click="dialog_visible.add = true">
                                添加工具
                            </el-button>
                        </template>
                        <template #default="scope">
                            <el-button
                                :disabled="disabled.delete"
                                size="small"
                                type="danger"
                                @click="delete_tool(scope.row.id)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </admin-view>

    <el-dialog v-model="dialog_visible.add" align-center title="添加工具" width="30%">
        <el-form>
            <el-form-item label="工具名称：">
                <el-input v-model="tool.name" placeholder="请输入工具名称"/>
            </el-form-item>
            <el-form-item label="工具链接：">
                <el-input v-model="tool.url" placeholder="请输入工具链接"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="cancel_add">取消</el-button>
            <el-button :disabled="disabled.add" type="primary" @click="add_tool">添加工具</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>
