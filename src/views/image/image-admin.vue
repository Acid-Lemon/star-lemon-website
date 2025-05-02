<script>
import {ElAutoResizer, ElNotification} from 'element-plus';
import {ArrowLeft, Close, Download, UploadFilled} from '@element-plus/icons-vue'
import {call_api} from "@/src/utils/cloud";
import AdminView from "@/src/components/admin.vue";
import axios from "axios";

export default {
    name: "image-admin",
    inheritAttrs: false,
    components: {Close, Download, AdminView, ElAutoResizer, UploadFilled, ArrowLeft},
    data() {
        return {
            upload_list: [],
            photo_list: [],
            upload_url: "",
            data: {},
            disabled: false,
            index: 0,
            current_page: 1,
            images: [],
            image: null,
            search_content: "",
            has_more: true,
            loading_more: false,
            pages: 0,
            show_large_image: false,
            selected_image: null,
            scale: 1,
            position: {x: 0, y: 0},
            isDragging: false,
            startPosition: {x: 0, y: 0}
        }
    },
    computed: {
        filtered_images() {
            const searchContent = this.search_content;
            const re = new RegExp(this.search_content, 'i');
            const dateRange = this.date_range;

            return this.images.filter(image => {
                const nameMatch = re.test(image.name) || !searchContent;
                const dateMatch = !dateRange || new Date(image.create_at) >= dateRange[0] && new Date(image.create_at) <= dateRange[1];

                return nameMatch && dateMatch;
            });
        },
        state() {
            return !this.has_more || this.loading_more
        }
    },
    async mounted() {
        await this.get_images();
    },
    methods: {
        async get_images() {
            this.loading_more = true;
            this.pages += 1;
            console.log(`开始加载第${this.pages}页数据`);
            let start_time = new Date().getTime();
            let skip_number = 0;
            if (this.pages !== 1) {
                start_time = this.images[this.images.length - 1].create_at;
                skip_number = this.skip_number();
            }
            console.log(start_time);
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
                this.pages -= 1;
                this.loading_more = false;
                return
            }
            console.log(`第${this.pages}页数据已加载`);
            console.log(res);
            this.images = this.images.concat(res.data.images_info);


            this.has_more = res.data.images_info.length === 20;
            this.loading_more = false;
        },
        upload() {
            console.log("开始");
            this.disabled = true;
            this.photo_list = this.upload_list;
            this.uploadImage();
        },
        async uploadImage() {
            if (this.index >= this.photo_list.length) {
                this.photo_list = [];
                this.upload_list = [];
                this.index = 0;
                this.disabled = false;
                return;
            }

            this.upload_list = [];
            this.upload_list.push(this.photo_list[this.index]);

            let res = await call_api("album/create_image", {
                folder_id: this.$route.query.album_id,
                image_name: this.upload_list[0].name
            });

            console.log(res);

            if (res.success) {
                this.images.push({
                    name: this.upload_list[0].name,
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
        clear() {
            this.search_content = "";
            this.date_range = null;
        },
        search_divide(text) {
            let li = [];
            const search_re = new RegExp(this.search_content, 'i');

            while (text.length) {
                let match_res = search_re.exec(text);
                if (match_res === null) {
                    li.push({type: "text", words: text});
                    break;
                }
                let match_full_text = match_res[0];
                if (match_res.index > 0) {
                    li.push({type: "text", words: text.substring(0, match_res.index)});
                }
                text = text.slice(match_res.index + match_full_text.length);
                li.push({type: "search", words: match_full_text});
            }

            return li;
        },
        view_large_image(image) {
            this.selected_image = image;
            this.show_large_image = true;
        },
        async download_image() {
            this.scale = 1;
            this.position = {x: 0, y: 0};
            if (this.selected_image) {
                try {
                    const response = await axios({
                        url: this.selected_image.temp_url,
                        method: 'GET',
                        responseType: 'blob',
                    });

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', this.selected_image.name || 'image');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Download failed:', error);
                    ElNotification({
                        title: 'Error',
                        message: '下载图片失败',
                        type: 'error'
                    });
                }
            }
        },
        onWheel(event) {
            event.preventDefault();
            const delta = event.deltaY;
            if (delta < 0) {
                this.scale = Math.min(this.scale + 0.1, 3);
            } else {
                this.scale = Math.max(this.scale - 0.1, 0.5);
            }
        },
        onMouseDown(event) {
            this.isDragging = true;
            this.startPosition = {x: event.clientX - this.position.x, y: event.clientY - this.position.y};
        },
        onMouseMove(event) {
            if (this.isDragging) {
                this.position.x = event.clientX - this.startPosition.x;
                this.position.y = event.clientY - this.startPosition.y;
            }
        },
        onMouseUp() {
            this.isDragging = false;
        }
    }
}
</script>

<template>
    <admin-view>
        <div class="w-full h-[95vh] bg-[#F8FAFD] flex flex-col content-center items-center">
            <div
                class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md w-[95%] h-[8vh] flex flex-col items-start justify-between mt-[20px] p-[20px]">
                <div class="w-full flex flex-row justify-between items-center">
                    <div class="flex flex-row justify-center items-center">
                        <el-upload
                            ref="upload"
                            v-model:file-list="upload_list"
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
                                upload_list.length
                            }}张照片
                        </div>
                        <el-button :disabled="disabled" style="margin-right: 100px" @click="this.upload_list = []">清除
                        </el-button>
                    </div>
                    <div>
                        <el-button @click="on_back">返回</el-button>
                        <el-button :disabled="disabled" type="primary" @click="upload">上传</el-button>
                    </div>
                </div>
            </div>
            <div class="h-[82%] w-[95%] my-[2vh]">
                <el-scrollbar>
                    <div v-if="filtered_images.length > 0" v-infinite-scroll="get_images"
                         :infinite-scroll-disabled="state"
                         class="md:columns-5 columns-2 column-gap-[20px]" infinite-scroll-delay=1000
                         infinite-scroll-distance=100>
                        <div v-for="image in filtered_images"
                             :key="image.id"
                             class="shadow-md break-inside-avoid mb-[20px]">
                            <div class="cursor-pointer" @click="view_large_image(image)">
                                <el-image :src="image.temp_url" class="w-full h-auto" fit="cover"/>
                            </div>
                            <div>
                                <div class="text-[14px] font-['SYHT'] font-semibold px-[10px] py-[5px]">
                                    <div v-if="search_content!==''"
                                         class="flex flex-row items-center whitespace-normal break-all">
                                        <span class="whitespace-nowrap">图片名：</span>
                                        <div v-for="split_content in search_divide(image.name)"
                                             class="flex flex-row items-center">
                                        <span v-if="split_content.type==='text'"
                                              class="text-[#000000] whitespace-nowrap">{{
                                                split_content.words
                                            }}</span>
                                            <span v-if="split_content.type==='search'"
                                                  class="text-[#dd5a00] whitespace-nowrap">{{
                                                    split_content.words
                                                }}</span>
                                        </div>
                                    </div>
                                    <div v-else
                                         class="text-[14px] font-['SYHT'] font-semibold whitespace-normal break-all px-[10px] py-[5px]">
                                        图片名：{{
                                            image.name
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="filtered_images.length === 0 && !loading_more"
                         class="w-full h-[85vh] flex flex-row items-center justify-center">
                        <div class="font-['SYST'] text-[40px]">当前相册没有图片</div>
                    </div>
                    <div v-if="loading_more" class="w-full h-[20vh] flex flex-row items-center justify-center">
                        <div class="text-[3vh] font-['SYST']">正在加载中</div>
                    </div>
                    <div v-if="!has_more && filtered_images.length > 0"
                         class="w-full h-[20vh] flex flex-row items-center justify-center">
                        <div class="text-[3vh] font-['SYST']">没有更多图片惹</div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </admin-view>

    <el-dialog v-model="show_large_image" :fullscreen="true" :show-close="false">
        <div class="z-[1000] absolute top-4 right-4 flex gap-2">
            <el-button circle type="primary" @click="download_image">
                <el-icon>
                    <Download/>
                </el-icon>
            </el-button>
            <el-button circle @click="show_large_image = false">
                <el-icon>
                    <Close/>
                </el-icon>
            </el-button>
        </div>
        <div
            class="overflow-hidden"
            @mousedown="onMouseDown"
            @mouseleave="onMouseUp"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @wheel="onWheel"
        >
            <el-image
                v-if="selected_image"
                :src="selected_image.temp_url"
                :style="{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }"
                class="h-[100vh] w-[100vw] select-none pointer-events-none"
                fit="contain"
            />
        </div>
    </el-dialog>

</template>

<style scoped>

</style>
