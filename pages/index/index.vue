<script>
	import NavigationBar from '@/src/components/NavigationBar.vue'
	import Copyright from '@/src/components/Copyright.vue'

	export default {
		data() {
			return {};
		},
		components: {
			NavigationBar,
			Copyright
		}
	}
</script>

<template>
	<NavigationBar></NavigationBar>
	<router-view></router-view>
	<Copyright></Copyright>
</template>

<style>
	/*每个页面公共css */
  @import '/static/font/font.css';
	page {
		height: 100%
	}
</style>