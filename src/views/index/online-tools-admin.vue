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
        async delete_tool(id) {
            this.disabled.delete = true;

            let res = await call_api("online_tools/delete_online_tool", {
                tool_id: id
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

            this.disabled.delete = false;
        }
    }
};
</script>

<template>
    <admin-view>
        <div class="w-full [95vh] bg-[#F8FAFD]">
            <div class="w-full h-[10vh] flex flex-row items-center justify-around">
                <el-form inline>
                    <el-form-item label="工具名称：">
                        <el-input v-model="tool.name" placeholder="请输入工具名称"/>
                    </el-form-item>
                    <el-form-item label="工具链接：">
                        <el-input v-model="tool.url" placeholder="请输入工具链接"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="disabled.add" type="primary" @click="add_tool">添加工具</el-button>
                    </el-form-item>
                </el-form>
            </div>
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
                <el-table-column label="操作" width="200">
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
    </admin-view>
</template>

<style scoped>

</style>
