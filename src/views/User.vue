<script>
	export default {
		methods: {
			open() {
				this.$refs.popup.open()
			},
			/**
			 * 点击取消按钮触发
			 * @param {Object} done
			 */
			close() {
				// TODO 做一些其他的事情，before-close 为true的情况下，手动执行 close 才会关闭对话框
				// ...
				this.$refs.popup.close()
			},
			/**
			 * 点击确认按钮触发
			 * @param {Object} done
			 * @param {Object} value
			 */
			confirm(value) {
				// 输入框的值
				console.log(value)
				// TODO 做一些其他的事情，手动执行 close 才会关闭对话框
				// ...
				this.$refs.popup.close()
			}
		}
	}
</script>

<template>
	<div class="h-full w-full">
    <div class="bg-[url('/static/background/12.jpg')] bg-cover h-[40%] relative">
      <div class="absolute bottom-[-5vh] left-[10vw] flex flex-row items-end">
      <img src="/static/favicon/favicon.png" class="h-[10vh] w-[10vh] rounded-full mr-[10px]" />
      <p class="font-['SYST'] text-[24px] mr-[20px] leading-none pb-[5px]">Lemon</p>
      <p class="font-['SYST'] text-[18px] mr-[10px] leading-none pb-[5px]">ID：552545</p>
      <div class="bg-[#36BDB4] rounded-md mb-[3px] mr-[20px] text-[12px] h-[20px] w-[50px] flex flex-row justify-center items-center">
        管理员
      </div>
      <p class="font-['SYST'] text-[14px] mr-[20px] leading-none pb-[5px]">生日：2006年3月1日</p>
      <p class="font-['SYST'] text-[14px] opacity-50 leading-none pb-[5px]">Hi！希望你开心～</p>
      </div>
      <button class="absolute bottom-[-5vh] right-[10vw] h-[30px] w-[100px] bg-[#83C0E5] leading-none flex flex-row justify-center items-center" @click="open">
        编辑信息
      </button>
      <uni-popup ref="popup" type="dialog">
      	<uni-popup-dialog mode="input" message="成功消息" :duration="2000" :before-close="true" @close="close" @confirm="confirm"></uni-popup-dialog>
      </uni-popup>
    </div>
  </div>
</template>
<style scoped>
</style>