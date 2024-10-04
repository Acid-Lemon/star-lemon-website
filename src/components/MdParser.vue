<script>
import VditorPreview from 'vditor/dist/method.min'

export default {
    name: 'MdParser',
    props: {
        content: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            vditor: null
        };
    },
    mounted() {
        VditorPreview.preview(this.$refs.vditor, this.content, {
            theme: {
                current: 'light'
            },
            hljs: {
                style: 'github'
            }
        })
    },
    beforeDestroy() {
        if (this.vditor) {
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