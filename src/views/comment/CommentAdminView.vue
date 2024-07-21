<script>
  import {ElNotification} from "element-plus";
  import {call_api} from "@/src/utils/cloud";
  import {date_format} from "@/src/utils/time";

  export default {
    data() {
      return {
        message_list: [],
        pages: 0,
        currentPage: 1,
        info: null,
        activeName: "all",
      }
    },

    async mounted() {
      await this.get_messages();
    },
    methods: {
      async get_messages() {
        this.pages += 1;
        console.log(this.pages);

        let start_time = 1577808000000;
        if (this.pages !== 1) {
          start_time = this.message_list[this.pages - 2][this.message_list[this.pages - 2].length - 1].create_at;
        }

        let res = await call_api("message_board/get_messages", {
          start_time,
          message_number: 20
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
      handleShow() {
        console.log("修改可见状态")
      },
      handleDelete() {
        console.log("删除")
      },
      handleClick() {

      },
      async nextClick() {
      },
      async change() {
        if(this.pages + 1 === this.currentPage) {
          await this.get_messages()
        }

      },
      pageCount() {
        return this.message_list[this.pages - 1]?.length < 20 ? this.pages : this.pages + 1
      }
    },
  }
</script>

<template>
  <div class="w-full h-full bg-[#F8FAFD] flex flex-col content-center items-center">
    <el-tabs v-model="activeName" class="w-[95%]" @tab-click="handleClick">
      <el-tab-pane label="全部" name="all">
    <div class="w-full">
      <el-table :data="message_list[currentPage - 1]" border max-height="80vh" :row-style="(row) => {return row.row.public_state ? '--el-table-tr-bg-color: var(--el-color-success-light-9)' : '--el-table-tr-bg-color: var(--el-color-warning-light-9)'}" style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column label="留言id" prop="id" width="250"/>
        <el-table-column label="内容" prop="content"/>
        <el-table-column label="可见状态" prop="public_state" :formatter="(row) => {return row.public_state ? '可见' : '不可见'}" width="100"/>
        <el-table-column label="发布者" prop="user.name" width="100"/>
        <el-table-column label="发布者id" prop="user.id" width="250"/>
        <el-table-column label="发布时间" prop="create_at_format_str" width="250"/>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                @click="handleShow(scope.$index, scope.row)"
            >
              {{ message_list[currentPage - 1][scope.$index].public_state ? "隐藏" : "显示" }}
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination layout="prev, pager, next" v-model:current-page="currentPage" :page-count="pageCount()" @change="change()" @next-click="nextClick()" />
    </div>
    </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
</style>