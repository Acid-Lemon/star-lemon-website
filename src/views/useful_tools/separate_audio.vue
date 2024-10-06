<script>
import {ElNotification} from 'element-plus'
import JSZip from 'jszip'

export default {
    data() {
        return {
            file_list: [],
            processed_files: [],
            is_processing: false,
            progress: 0
        }
    },
    methods: {
        handle_file_change(file, file_list) {
            this.file_list = file_list;
            this.processed_files = file_list.map(file => ({
                name: file.name,
                status: '未处理',
                blob: null
            }));
        },
        async process_all_videos() {
            if (this.file_list.length === 0) {
                ElNotification({
                    title: '警告',
                    message: '请先选择视频文件',
                    type: 'warning'
                });
                return;
            }

            this.is_processing = true;
            this.progress = 0;

            for (let i = 0; i < this.file_list.length; i++) {
                const file = this.file_list[i];
                try {
                    const audio_blob = await this.extract_audio(file.raw);
                    console.log(`处理完成: ${file.name}, blob size: ${audio_blob.size}`);
                    this.processed_files[i].blob = audio_blob;
                    this.processed_files[i].status = '处理完成';
                } catch (error) {
                    console.error('音频分离失败:', error);
                    this.processed_files[i].status = '处理失败';
                }
                this.progress = ((i + 1) / this.file_list.length) * 100;
            }

            this.is_processing = false;
            console.log('处理后的文件:', this.processed_files);
            ElNotification({
                title: '成功',
                message: '所有视频处理完成',
                type: 'success'
            });
        },
        async extract_audio(video_file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const audio_context = new (window.AudioContext || window.webkitAudioContext)();
                        const audio_buffer = await audio_context.decodeAudioData(e.target.result);
                        const wav_blob = await this.create_wav_file(audio_buffer);
                        resolve(wav_blob);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = (e) => reject(new Error('文件读取失败'));
                reader.readAsArrayBuffer(video_file);
            });
        },

        async create_wav_file(audio_buffer) {
            const offline_context = new OfflineAudioContext(
                audio_buffer.numberOfChannels,
                audio_buffer.length,
                audio_buffer.sampleRate
            );

            const source = offline_context.createBufferSource();
            source.buffer = audio_buffer;
            source.connect(offline_context.destination);
            source.start();

            const rendered_buffer = await offline_context.startRendering();

            const wav = this.buffer_to_wave(rendered_buffer);
            return new Blob([wav], {type: 'audio/wav'});
        },

        buffer_to_wave(audio_buffer) {
            const num_channels = audio_buffer.numberOfChannels;
            const length = audio_buffer.length * num_channels * 2;
            const buffer = new ArrayBuffer(44 + length);
            const view = new DataView(buffer);

            const write_string = (view, offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };

            // Write WAV header
            write_string(view, 0, 'RIFF');
            view.setUint32(4, 36 + length, true);
            write_string(view, 8, 'WAVE');
            write_string(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, num_channels, true);
            view.setUint32(24, audio_buffer.sampleRate, true);
            view.setUint32(28, audio_buffer.sampleRate * num_channels * 2, true);
            view.setUint16(32, num_channels * 2, true);
            view.setUint16(34, 16, true);
            write_string(view, 36, 'data');
            view.setUint32(40, length, true);

            // Write audio data
            const offset = 44;
            for (let i = 0; i < audio_buffer.numberOfChannels; i++) {
                const channel_data = audio_buffer.getChannelData(i);
                for (let j = 0; j < channel_data.length; j++) {
                    const index = offset + (j * num_channels + i) * 2;
                    const sample = Math.max(-1, Math.min(1, channel_data[j]));
                    view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                }
            }

            return buffer;
        },
        download_single_audio(file) {
            if (!file.blob) {
                ElNotification({
                    title: '警告',
                    message: '该文件尚未处理完成',
                    type: 'warning'
                });
                return;
            }

            const url = URL.createObjectURL(file.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^/.]+$/, "") + '.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        async download_all_audio() {
            const processed_files = this.processed_files.filter(file => file.blob);
            console.log('可下载的文件数量:', processed_files.length);

            if (processed_files.length === 0) {
                ElNotification({
                    title: '警告',
                    message: '没有可下载的音频文件',
                    type: 'warning'
                });
                return;
            }

            const zip = new JSZip();

            processed_files.forEach(file => {
                const file_name = file.name.replace(/\.[^/.]+$/, "") + '.wav';
                zip.file(file_name, file.blob);
            });

            try {
                const content = await zip.generateAsync({type: "blob"});
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'extracted_audio.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('创建 zip 文件失败:', error);
                ElNotification({
                    title: '错误',
                    message: '创建下载文件失败',
                    type: 'error'
                });
            }
        }
    }
}
</script>


<template>
    <div class="w-full h-full flex flex-row items-center justify-center">
        <el-card style="width: 500px">
            <div slot="header" class="clearfix">
                <span class="text-xl font-bold">视频音频分离</span>
            </div>
            <el-form>
                <el-form-item>
                    <el-upload
                        :auto-upload="false"
                        :file-list="file_list"
                        :on-change="handle_file_change"
                        accept="video/*"
                        action="#"
                        class="w-full mt-[10px]"
                        drag
                        multiple
                    >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div slot="tip" class="el-upload__tip">可以选择多个视频文件</div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <div class="w-full flex flex-row items-center justify-between">
                        <el-button
                            :disabled="file_list.length === 0"
                            :loading="is_processing"
                            type="primary"
                            @click="process_all_videos"
                        >
                            {{ is_processing ? '处理中...' : '处理所有视频' }}
                        </el-button>
                        <el-button
                            :disabled="processed_files.length === 0"
                            type="success"
                            @click="download_all_audio"
                        >
                            下载所有音频
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item v-if="is_processing">
                    <el-progress :format="(percentage) => `${percentage}%`" :percentage="progress"></el-progress>
                </el-form-item>
            </el-form>
            <el-table :data="processed_files" style="width: 100%">
                <el-table-column label="文件名" prop="name"></el-table-column>
                <el-table-column label="状态" prop="status"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button :disabled="!scope.row.blob" size="small" @click="download_single_audio(scope.row)">
                            下载
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

    </div>

</template>