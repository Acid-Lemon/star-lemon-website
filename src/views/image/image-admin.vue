<script>
import {ElAutoResizer, ElNotification} from 'element-plus';
import {ArrowLeft, UploadFilled} from '@element-plus/icons-vue'
import {call_api} from "@/src/utils/cloud";
import AdminView from "@/src/components/admin.vue";

export default {
    name: "image-admin",
    inheritAttrs: false,
    components: {AdminView, ElAutoResizer, UploadFilled, ArrowLeft},
    data() {
        return {
            photo_albums: [],
            photo_album: null,
            photo_albums_types: [
                {
                    value: 'shared',
                    label: '共享相册'
                },
                {
                    value: 'public',
                    label: '公开相册'
                },
                {
                    value: 'private',
                    label: '私密相册'
                },
            ],
            photo_albums_type: {
                value: 'private',
                label: '私密相册'
            },
            devices: [
                {value: 'screenshot', label: '截图'},
                {value: 'phone', label: '手机'},
                {value: 'camera', label: '相机'},
                {value: 'CCD', label: 'CCD'},
            ],
            device: {value: 'screenshot', label: '截图'},
            photo_album_name: "",
            image_list: [],
            photo_list: [],
            upload_url: "",
            data: {},
            images: [],
            disabled: false,
            index: 0,
            pages: 0,
            current_page: 1,
            date: null
        }
    },
    async mounted() {
        await this.get_images();
    },
    methods: {
        async get_images() {
            this.pages += 1;
            console.log(`开始加载第${this.pages}页数据`);
            let start_time = new Date().getTime();
            let skip_number = 0;
            if (this.pages !== 1) {
                start_time = this.images[this.pages - 2][this.images[this.pages - 2].length - 1].create_at;
                skip_number = this.skip_number();
            }
            let res = await call_api("album/get_images", {
                folder_id: this.$route.query.album_id,
                time_range: {
                    from_time: start_time,
                    to_time: 0
                },
                image_number: 20,
                skip_number
            })
            if (!res.success) {
                if (res.code === "err_no_folder") {
                    this.$router.push('/404');
                    return
                }
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: `获取图片失败`
                });
                this.pages -= 1;
                console.log(res);

                return
            }

            this.images = this.images.concat([res.data.images_info]);
        },
        upload() {
            console.log("开始");
            this.disabled = true;
            this.photo_list = this.image_list;
            this.uploadImage();
        },
        async uploadImage() {
            if (this.index >= this.photo_list.length) {
                this.photo_list = [];
                this.image_list = [];
                this.index = 0;
                this.disabled = false;
                return;
            }

            this.image_list = [];
            this.image_list.push(this.photo_list[this.index]);

            let res = await call_api("album/create_image", {
                folder_id: this.$route.query.album_id,
                image_name: this.image_list[0].name
            });

            console.log(res);

            if (res.success) {
                this.images[this.current_page - 1].push({
                    name: this.image_list[0].name,
                    id: "",
                    temp_url: ""
                })

            } else {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: `第${this.index + 1}张请求上传失败`
                });
                console.log(res);

                this.index++;
                await this.uploadImage();

                return;
            }

            this.upload_url = res.data.upload_options.url;
            this.data = res.data.upload_options.formData;

            this.$refs.upload.submit();
        },
        async on_success() {
            ElNotification({
                title: 'Success',
                type: "success",
                message: `第${this.index + 1}张上传成功`
            });

            this.index++;
            await this.uploadImage();
        },
        async on_error() {
            ElNotification({
                title: 'Error',
                type: "error",
                message: `第${this.index + 1}张上传失败`
            });
            this.index++;
            await this.uploadImage();
        },
        handle_delete(index, row) {
            console.log("删除")
        },
        async change() {
            if (this.pages + 1 === this.current_page) {
                await this.get_images()
            }

        },
        page_count() {
            return this.images[this.pages - 1]?.length === 20 ? this.pages + 1 : this.pages
        },
        skip_number() {
            let index = 1;
            while (this.images[this.pages - 2][this.images[this.pages - 2].length - index].create_at === this.images[this.pages - 2][this.images[this.pages - 2].length - index - 1].create_at) {
                index += 1;
            }
            return index;
        },
        on_back() {
            if (window.history.length > 1) {
                this.$router.back()
            } else {
                this.$router.push('/admin/album');
            }
        },
    }
}
</script>

<template>
    <admin-view>
        <div class="w-full h-[95vh] bg-[#F8FAFD] flex flex-col content-center items-center">
            <div
                class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md w-[95%] h-[15vh] flex flex-col items-start justify-between mt-[20px] p-[20px]">
                <div class="w-full flex flex-row justify-between items-center">
                    <div class="flex flex-row justify-center items-center">
                        <div>图片名称：</div>
                        <el-input style="width: 10vw; height: 30px"></el-input>
                    </div>
                    <div class="flex flex-row justify-center items-center">
                        <div>拍摄时间：</div>
                        <el-date-picker v-model="date"
                                        style="width: 10vw; height: 30px"
                                        type="date"
                        />
                    </div>
                    <div class="flex flex-row justify-center items-center">
                        <div>拍摄地点：</div>
                        <el-input style="width: 10vw; height: 30px"></el-input>
                    </div>
                    <div class="flex flex-row justify-center items-center">
                        <div>拍摄设备：</div>
                        <el-select
                            v-model="device"
                            style="width: 10vw; height: 30px"
                        >
                            <el-option
                                v-for="device in devices"
                                :key="device.value"
                                :label="device.label"
                                :value="device.value"
                            />
                        </el-select>
                    </div>
                </div>
                <div class="w-full flex flex-row justify-between items-center">
                    <div class="flex flex-row justify-center items-center">
                        <el-upload
                            ref="upload"
                            v-model:file-list="image_list"
                            :action="upload_url"
                            :auto-upload=false
                            :data="data"
                            :multiple=true
                            :on-error="on_error"
                            :on-success="on_success"
                            :show-file-list=false
                            style="margin-right: 20px"
                        >
                            <el-button :disabled="disabled" type="primary">选择图片</el-button>
                        </el-upload>
                        <div class="mr-[20px]">已选择{{
                                image_list.length
                            }}张照片
                        </div>
                        <el-button :disabled="disabled" style="margin-right: 100px" @click="this.image_list = []">清除
                        </el-button>
                    </div>
                    <el-button :disabled="disabled" type="primary" @click="upload">上传</el-button>
                </div>
            </div>
            <div class="w-[95%] my-[2vh]">
                <el-table :data="images[current_page - 1]" border max-height="70vh" style="width: 100%">
                    <el-table-column type="index" width="50"/>
                    <el-table-column label="图片名称" prop="name" width="150"/>
                    <el-table-column label="图片id" prop="id" width="250"/>
                    <el-table-column label="下载链接" prop="temp_url"/>
                    <el-table-column label="操作" width="100">
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="danger"
                                @click="handle_delete(scope.$index, scope.row)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination v-model:current-page="current_page" :page-count="page_count()" layout="prev, pager, next"
                               @change="change()"/>
            </div>
        </div>
    </admin-view>

</template>

<style scoped>

</style>
