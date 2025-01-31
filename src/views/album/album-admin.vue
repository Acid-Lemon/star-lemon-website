<script>
import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import {Picture} from "@element-plus/icons-vue";
import AdminView from "@/src/components/admin.vue";

export default {
    name: "ImageView",
    components: {AdminView, Picture},
    data() {
        return {
            images: [],
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
            photo_album_name: "",
            photo_albums: [],
            photo_album: "",
            has_photo_albums: true,
            active_name: "shared",
            disabled: false,
            loading: false
        };
    },
    async mounted() {
        await this.get_folders()
    },
    methods: {
        async get_folders() {
            this.loading = true;

            this.photo_albums = [];

            let res = await call_api("album/get_folders", {
                public_state: this.active_name
            });
            if (!res.success) {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: `获取相册失败`
                });
                console.log(res);

                return;
            }
            this.photo_albums = res.data.folders_info;

            for (let i = 0; i < this.photo_albums.length; i++) {
                this.photo_albums[i].cover = await this.get_album_cover(this.photo_albums[i].id)
            }

            this.has_photo_albums = this.photo_albums.length !== 0;

            this.loading = false;
        },
        async get_album_cover(folder_id) {
            let start_time = new Date().getTime();
            let res = await call_api("album/get_images", {
                folder_id: folder_id,
                time_range: {
                    from_time: start_time,
                    to_time: 0
                },
                image_number: 1,
                skip_number: 0
            })

            return res.data.images_info[0].temp_url;
        },
        async create_new_photo_album() {
            let res = await call_api("album/create_folder", {
                folder_name: this.photo_album_name,
                public_state: this.active_name
            });

            if (!res.success) {
                ElNotification({
                    title: 'Error',
                    type: "error",
                    message: res
                });

                return;
            }

            this.photo_albums.push({
                name: this.photo_album_name,
                id: res.data.folder_id,
                value: this.active_name,
            });
            this.photo_album_name = "";
            this.photo_album = this.photo_albums[this.photo_albums.length - 1];

            ElNotification({
                title: 'Success',
                type: "success",
                message: "创建成功"
            });
        },
    },
};
</script>

<template>
    <admin-view>
        <div class="w-full h-full flex flex-col items-center overflow-y-hidden bg-[#F8FAFD]">
            <div class="h-[95vh] w-[90vw]">
                <el-tabs v-model="active_name" v-loading="loading" class="demo-tabs" @tab-change="get_folders">
                    <el-tab-pane label="共享相册" name="shared">
                        <div class="h-[95vh]">
                            <div class="flex flex-row items-center mb-[20px]">
                                <el-input v-model="photo_album_name" placeholder="相册名"
                                          style="width: 240px;margin-right: 20px"></el-input>
                                <el-button :disabled="disabled" type="primary" @click="create_new_photo_album()">
                                    新建相册
                                </el-button>
                            </div>
                            <el-scrollbar>
                                <div v-if="has_photo_albums"
                                     class="md:columns-5 columns-2 column-gap-[20px]">
                                    <div v-for="photo_album in photo_albums"
                                         :key="photo_album.id"
                                         class="shadow-md break-inside-avoid mb-[20px]">
                                        <router-link
                                            :to="'/admin/album/' + photo_album.name + '?album_id=' + photo_album.id">
                                            <div>
                                                <el-image
                                                    :src="photo_album.cover"
                                                    class="w-full h-[20vh]"
                                                    fit="cover">
                                                    <template #error>
                                                        <div class="image-slot">
                                                            <el-icon style="width:100%; height:20vh">
                                                                <Picture style="width: 50px;height:50px"/>
                                                            </el-icon>
                                                        </div>
                                                    </template>
                                                </el-image>
                                            </div>
                                            <div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    相册名：{{ photo_album.name }}
                                                </div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    id：{{ photo_album.id }}
                                                </div>
                                            </div>
                                        </router-link>
                                    </div>
                                </div>
                                <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
                                    <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
                                </div>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="公共相册" name="public">
                        <div class="h-[95vh]">
                            <div class="flex flex-row items-center mb-[20px]">
                                <el-input v-model="photo_album_name" placeholder="相册名"
                                          style="width: 240px;margin-right: 20px"></el-input>
                                <el-button :disabled="disabled" type="primary" @click="create_new_photo_album()">
                                    新建相册
                                </el-button>
                            </div>
                            <el-scrollbar>
                                <div v-if="has_photo_albums"
                                     class="md:columns-5 columns-2 column-gap-[20px]">
                                    <div v-for="photo_album in photo_albums"
                                         :key="photo_album.id"
                                         class="shadow-md break-inside-avoid mb-[20px]">
                                        <router-link
                                            :to="'/admin/album/' + photo_album.name + '?album_id=' + photo_album.id">
                                            <div>
                                                <el-image
                                                    :src="photo_album.cover"
                                                    class="w-full h-[20vh]"
                                                    fit="cover">
                                                    <template #error>
                                                        <div class="image-slot">
                                                            <el-icon style="width:100%; height:20vh">
                                                                <Picture style="width: 50px;height:50px"/>
                                                            </el-icon>
                                                        </div>
                                                    </template>
                                                </el-image>
                                            </div>
                                            <div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    相册名：{{ photo_album.name }}
                                                </div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    id：{{ photo_album.id }}
                                                </div>
                                            </div>
                                        </router-link>
                                    </div>
                                </div>
                                <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
                                    <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
                                </div>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="私密相册" name="private">
                        <div class="h-[95vh]">
                            <div class="flex flex-row items-center mb-[20px]">
                                <el-input v-model="photo_album_name" placeholder="相册名"
                                          style="width: 240px;margin-right: 20px"></el-input>
                                <el-button :disabled="disabled" type="primary" @click="create_new_photo_album()">
                                    新建相册
                                </el-button>
                            </div>
                            <el-scrollbar>
                                <div v-if="has_photo_albums"
                                     class="md:columns-5 columns-2 column-gap-[20px]">
                                    <div v-for="photo_album in photo_albums"
                                         :key="photo_album.id"
                                         class="shadow-md break-inside-avoid mb-[20px]">
                                        <router-link
                                            :to="'/admin/album/' + photo_album.name + '?album_id=' + photo_album.id">
                                            <div>
                                                <el-image
                                                    :src="photo_album.cover"
                                                    class="w-full h-[20vh]"
                                                    fit="cover">
                                                    <template #error>
                                                        <div class="image-slot">
                                                            <el-icon style="width:100%; height:20vh">
                                                                <Picture style="width: 50px;height:50px"/>
                                                            </el-icon>
                                                        </div>
                                                    </template>
                                                </el-image>
                                            </div>
                                            <div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    相册名：{{ photo_album.name }}
                                                </div>
                                                <div class="text-[14px] px-[10px] py-[2px] whitespace-normal break-all">
                                                    id：{{ photo_album.id }}
                                                </div>
                                            </div>
                                        </router-link>
                                    </div>
                                </div>
                                <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
                                    <span class="font-['RGBZ'] text-[40px]">当前分类没有相册</span>
                                </div>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </admin-view>
</template>

<style scoped>

</style>
