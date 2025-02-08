<script>
import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import {Picture} from "@element-plus/icons-vue";

export default {
    name: "ImageView",
    components: {Picture},
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
            photo_albums: [],
            photo_album: "",
            has_photo_albums: true,
            active_name: "shared",
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
                console.error(res);
                this.loading = false;
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
        }
    }
};
</script>

<template>
    <div class="w-full h-full flex flex-col items-center overflow-y-hidden bg-[#F8FAFD]">
        <div class="h-[10vh] w-full"></div>
        <div class="h-[90vh] w-[90vw]">
            <el-tabs v-model="active_name" v-loading="loading" class="demo-tabs" @tab-change="get_folders">
                <el-tab-pane label="共享相册" name="shared">
                    <div class="h-[85vh]">
                        <el-scrollbar>
                            <div v-if="has_photo_albums"
                                 class="md:columns-5 columns-2 gap-[20px]">
                                <div v-for="photo_album in photo_albums"
                                     :key="photo_album.id"
                                     class="shadow-md break-inside-avoid"
                                     @click="this.$router.push(`/album/image?album_id=${photo_album.id}`)">
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
                                    <div
                                        class="font-['SYHT'] font-semibold text-[14px] px-[10px] py-[5px] whitespace-normal break-all">
                                        相册：{{ photo_album.name }}
                                    </div>
                                </div>
                            </div>
                            <div v-else class="w-full h-[85vh] flex flex-row items-center justify-center">
                                <span class="font-['SYST'] text-[40px]">当前分类没有相册</span>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="公共相册" name="public">
                    <div class="h-[85vh]">
                        <el-scrollbar>
                            <div v-if="has_photo_albums"
                                 class="md:columns-5 columns-2 column-gap-[20px]">
                                <div v-for="photo_album in photo_albums"
                                     :key="photo_album.id"
                                     class="shadow-md break-inside-avoid mb-[20px]">
                                    <router-link :to="'/album/' + photo_album.name + '?album_id=' + photo_album.id">
                                        <div>
                                            <el-image :src="photo_album.cover" class="w-full h-[20vh]"
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
                                <span class="font-['SYST'] text-[40px]">当前分类没有相册</span>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="私密相册" name="private">
                    <div class="h-[85vh]">
                        <el-scrollbar>
                            <div v-if="has_photo_albums"
                                 class="md:columns-5 columns-2 column-gap-[20px]">
                                <div v-for="photo_album in photo_albums"
                                     :key="photo_album.id"
                                     class="shadow-md break-inside-avoid mb-[20px]">
                                    <router-link :to="'/album/' + photo_album.name + '?album_id=' + photo_album.id">
                                        <div>
                                            <el-image :src="photo_album.cover" class="w-full h-[20vh]"
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
                                <span class="font-['SYST'] text-[40px]">当前分类没有相册</span>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<style scoped>

</style>
