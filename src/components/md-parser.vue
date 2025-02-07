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
    watch: {
        'content': {
            handler() {
                VditorPreview.preview(this.$refs.vditor, this.content, {
                    theme: {
                        current: 'light'
                    },
                    hljs: {
                        style: 'github'
                    }
                })

                const outlineContainer = document.getElementById('outline');
                const headers = this.content.match(/^(#{1,6})\s+(.*)$/gm);
                console.log(headers);
                if (headers) {
                    headers.forEach(header => {
                        const level = header.match(/#/g).length;
                        const title = header.replace(/^#+\s/, '').replace(/\*/g, '');
                        console.log(level, title);
                        const listItem = document.createElement('div');
                        listItem.style.marginLeft = `${(level - 1) * 10}px`; // 根据标题级别设置缩进
                        listItem.innerHTML = `<div>${title}</div>`;
                        outlineContainer.appendChild(listItem);
                    });
                }
            },
            deep: true
        }
    },
    mounted() {

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
