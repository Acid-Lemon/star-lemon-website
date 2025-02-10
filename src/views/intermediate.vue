<script>
export default {
    name: "intermediate",
    data() {
        return {
            url: "",
            countdown: 3,
            interval: null
        }
    },
    mounted() {
        this.url = this.$route.query.url;
        this.interval = setInterval(() => {
            this.countdown--;
            if (this.countdown === 0) {
                clearInterval(this.interval);
                window.open(this.url, '_blank');
            }
        }, 1000);
    },
    unmounted() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    },
    methods: {}
}
</script>

<template>
    <div class="bg-[url('/static/background/1.jpg')] w-full h-full bg-cover flex flex-row items-center justify-center">
        <div class="text-[4.5vh] font-bold text-[#FFFFFF] font-['SYHT'] text-center">
            正在跳转到外部页面<span class="text-red-400">{{ url }}</span>
            <br>
            还有<span class="text-red-400">{{ countdown }}S</span>
        </div>
    </div>
</template>

<style scoped>

</style>
