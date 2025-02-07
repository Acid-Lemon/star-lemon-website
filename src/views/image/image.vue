<script>
import {call_api} from "../../utils/cloud";
import {ElNotification} from "element-plus";
import {ArrowLeft, Close, Download} from "@element-plus/icons-vue";
import axios from "axios";

export default {
    components: {Download, Close, ArrowLeft},
    data() {
        return {
            images: [],
            image: null,
            search_content: "",
            date_range: null,
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
                const dateMatch = !dateRange || new Date(image.time) >= dateRange[0] && new Date(image.time) <= dateRange[1];

                return nameMatch && dateMatch;
            });
        },
        state() {
            return !this.has_more || this.loading_more
        }
    },
    watch: {},
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
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: `获取图片失败`
                });
                this.pages -= 1;
                this.loading_more = false;
                console.log(res);

                return
            }
            console.log(`第${this.pages}页数据已加载`);
            this.images = this.images.concat(res.data.images_info);


            this.has_more = res.data.images_info.length === 20;
            this.loading_more = false;
        },
        clear() {
            this.search_content = "";
            this.date_range = null;
        },
        skip_number() {
            let index = 1;
            while (this.images[this.images.length - index].create_at === this.images[this.images.length - index - 1].create_at) {
                index += 1;
            }
            return index;
        },
        on_back() {
            if (window.history.length > 1) {
                this.$router.back()
            } else {
                this.$router.push('/album');
            }
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
    <div class="h-full w-full flex flex-col justify-start items-center bg-[#F8FAFD]">
        <div class="fixed top-0 left-0 w-full h-[6vh] p-[10px] z-[1000] flex flex-row items-center">
            <div class="flex flex-row items-center text-[#000000] font-['SYST']" @click="on_back">
                <el-icon style="width: 25px; height: 25px">
                    <arrow-left style="width: 25px; height: 25px"/>
                </el-icon>
                返回
            </div>
            <div class="w-[1px] h-[80%] border border-[#000000] mx-[10px]"></div>
            <div class="text-[2vh] text-[#000000] font-['SYST']">{{ this.$route.params.album_name }}</div>
        </div>
        <div
            class="bg-[url('/static/background/17.jpg')] bg-cover rounded-md md:h-[6vh] h-[14vh] w-[95vw] flex flex-col justify-center mt-[5vh] md:p-[20px] p-[10px]">
            <div class="md:h-[5vh] h-[13vh] w-full flex md:flex-row flex-col md:items-center justify-between">
                <div class="flex flex-row items-center">
                    <div class="mx-[5px]">搜索图片</div>
                    <div class="w-[240px] mx-[5px]">
                        <el-input v-model="search_content" placeholder="请输入图片名称"/>
                    </div>
                </div>
                <div class="flex flex-row items-center">
                    <div class="mx-[5px]">筛选日期</div>
                    <div class="w-[280px] mx-[5px]">
                        <el-date-picker v-model="date_range"
                                        end-placeholder="结束日期"
                                        range-separator="到"
                                        start-placeholder="开始日期"
                                        style="width: 100%"
                                        type="daterange"
                        />
                    </div>
                </div>
                <div class="flex flex-row items-center">
                    <el-button @click="clear">重置</el-button>
                </div>
            </div>
        </div>
        <div class="h-[82vh] w-[95vw] my-[2vh]">
            <el-scrollbar>
                <div v-if="filtered_images.length > 0" v-infinite-scroll="get_images" :infinite-scroll-disabled="state"
                     class="md:columns-5 columns-2 column-gap-[20px]" infinite-scroll-delay=1000
                     infinite-scroll-distance=100>
                    <div v-for="image in filtered_images"
                         :key="image.id"
                         class="shadow-md break-inside-avoid mb-[20px]">
                        <div class="cursor-pointer" @click="view_large_image(image)">
                            <el-image :src="image.temp_url" class="w-full h-auto" fit="cover"/>
                        </div>
                        <div>
                            <div class="px-[10px] py-[2px]">
                                <div v-if="search_content!==''" class="flex flex-row items-center">
                                    <span class="text-[14px]">图片名：</span>
                                    <div v-for="split_content in search_divide(image.name)"
                                         class="flex flex-row items-center">
                                        <span v-if="split_content.type==='text'"
                                              class="text-[14px] text-[#000000]">{{ split_content.words }}</span>
                                        <span v-if="split_content.type==='search'"
                                              class="text-[14px] text-[#dd5a00]">{{ split_content.words }}</span>
                                    </div>
                                </div>
                                <div v-else class="text-[14px]">图片名：{{ image.name }}</div>
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
