<script>
	import NavigationBar from '@/src/components/NavigationBar.vue'
	import Copyright from '@/src/components/Copyright.vue'

	export default {
		data() {
			return {
				show: {}
			};
		},
		onLoad() {
			this.$watch("$route", (to, _from) => {
				console.log(to, _from)
				this.show = to?.meta?.show;
			});
		},
		methods: {},
		components: {
			NavigationBar,
			Copyright
		}
	}
</script>

<template>
	<NavigationBar></NavigationBar>
	<router-view></router-view>
	<Copyright v-if="show ? show.copyright: true"></Copyright>
</template>

<style>
	@import "/static/font/font.css";

	page {
		height: 100%
	}
</style>