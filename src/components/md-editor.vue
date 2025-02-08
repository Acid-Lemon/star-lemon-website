<script>
import Vditor from 'vditor';

export default {
    name: 'MdEditor',
    data() {
        return {
            vditor: null
        };
    },
    props: ['modelValue'],
    emits: ['update:modelValue'],
    mounted() {
        this.vditor = new Vditor(this.$refs.vditor, {
            // 配置 Vditor 选项
            cache: false,
            lang: 'zh_CN',
            width: '100%',
            height: '100%',
            mode: 'ir',
            input: (value) => {
                // 监听输入事件
                this.$emit('update:modelValue', value);
            },
        });
    },
    watch: {
        modelValue: {
            handler(newValue, _oldValue) {
                if (newValue !== this.vditor.getValue()) {
                    this.vditor.setValue(newValue);
                }
            },
            deep: true // 启用深度监听
        }
    },
    beforeDestroy() {
        if (this.vditor) {
            this.vditor.clearCache();
            this.vditor.destroy();
        }
    },
};
</script>

<template>
    <div class="w-full h-full">
        <link href="/static/css/vditor.css" rel="stylesheet"/>
        <div ref="vditor"></div>
    </div>
</template>

<style scoped>
</style>
