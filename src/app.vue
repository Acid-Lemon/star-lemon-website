<script>
	import NavigationBar from '@/src/components/NavigationBar.vue'
	import Copyright from '@/src/components/Copyright.vue'

	export default {
		data() {
			return {
				show: this.$route?.meta?.show
			};
		},
		onLoad() {
			this.$watch("$route", (to, _from) => {
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
	<NavigationBar v-if="show?.hasOwnProperty('navigation_bar') ? show.navigation_bar: true"></NavigationBar>
	<router-view></router-view>
	<Copyright v-if="show?.hasOwnProperty('copyright') ? show.copyright: true"></Copyright>
</template>

<style>
	@import "/static/font/font.css";
</style>
