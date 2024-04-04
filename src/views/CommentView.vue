<script>
	import {
		call_api
	} from "@/src/utils/cloud";
	import {
		ElMessageBox
	} from "element-plus";

	import {
		date_format
	} from "@/src/utils/time";
	import {
		get_user
	} from "@/src/utils/user_info";

	export default {
		data() {
			return {
				value: "",
				message_list: [],
				buttonDisabled: false,
				style_mode: false,
				pages: 1
			};
		},
		async mounted() {
			await this.get_messages();
		},
		methods: {
			onFocus() {
				this.style_mode = true;
			},
			onBlur() {
				if (this.value === '') {
					this.style_mode = false;
				}
			},
			clear() {
				this.value = "";
				this.style_mode = false;
			},

			async messages_format(messages) {
				return await Promise.all(messages.map((message) => {
					return new Promise((resolve) => {
						message.user.avatar_filename = message.user.avatar + ".jpg"
						message.create_at_format_str = date_format(new Date(message.create_at));
						resolve(message);
					})
				}));
			},
			async get_messages() {
				let res = await call_api("getMessages");

				if (!res.success) {
					await ElMessageBox({
						type: "error",
						message: "获取留言失败",
						confirmButtonText: "确定",
						autofocus: true
					});

					return;
				}

				this.message_list = await this.messages_format(res.data.messages);
			},

			check_message(message) {
				if (message.length === 0) {
					ElMessageBox({
						type: "error",
						message: "留言不能为空哦!",
						confirmButtonText: "确定",
						autofocus: true
					});
					return false;
				}

				return true;
			},
			async publish_message() {
				this.buttonDisabled = true;

				let message = this.value;
				if (!this.check_message(message)) {
					this.buttonDisabled = false;
					return;
				}

				let res = await call_api("publishMessage", {
					content: message
				});

				if (res.api_call_success) {
					this.value = "";
				}

				if (!res.success) {
					await ElMessageBox({
						type: "error",
						message: res.error_message,
						confirmButtonText: "确定",
						autofocus: true
					});
					this.buttonDisabled = false;
					return;
				}

				let new_message = res.data.message; // (await this.messages_format([res.data.message]))[0];
				let user = get_user();
				new_message.user = {
					id: user.id,
					name: user.name,
					avatar: user.avatar
				};
				delete new_message.user_id;

				let new_message_format = (await this.messages_format([new_message]))[0];
				this.message_list.push(new_message_format);

				await ElMessageBox({
					type: "success",
					message: "发送成功"
				});
				this.buttonDisabled = false;
				this.style_mode = false;
			}
		}
	}
</script>

<template>
	<div
		class="bg-[url('/static/background/11.jpg')] bg-cover w-full md:h-[40%] flex flex-col items-center justify-center h-[30%]">
		<p class="text-[#000000] font-['SYST'] text-[6vh] hover:text-[#44cef6] duration-700">
			留言板
		</p>
	</div>
	<div class="flex flex-col items-center justify-center">
		<div
			class="border border-[#000000] m-[5vh] h-[30vh] md:w-[70%] w-[85%] flex flex-col items-center justify-center">
			<div class="relative top-[-2.5vh] bg-white">
				<p class="mx-[1vw] text-[3.6vh] font-['RGBZ']">网易云音乐热评</p>
			</div>
			<div class="w-full h-full flex flex-col items-center justify-center">
				<p class="text-[2.4vh] m-[2vh] font-['SJJS']">
					希望你别像风，在我这里掀起了万般波澜，却又跟云去了远方。
				</p>
				<p class="text-[1.9vh] m-[2vh] font-['SJJS']">——网易云音乐热评《如风过境》</p>
			</div>
		</div>
		<p class="mx-[2vh] font-serif text-[2.4vh]">
			很感谢你能访问该页面，如果你有什么和我说的，或者有什么问题想问的，可以随时在下面评论噢~！我看见了会第一时间回复你的。
		</p>
		<div class="flex flex-row md:w-[70%] w-[85%] mt-[2vh] border-b-[1px] border-[#000000]">
			<div class="flex flex-row items-end">
				<span class="text-[4vh] font-bold font-['RGBZ']">comment</span><span
					class="text-[2vh] mb-[1vh] mx-[2vh] font-['SJJS']">{{ message_list.length }}条评论</span>
			</div>
		</div>
		<div v-for="page in pages" class="my-[1em] flex flex-col items-center w-full">
			<div v-for="message in message_list" :key="message.id" class="my-[1em] flex flex-col items-center w-full">
				<div class="border border-[#000000] md:w-[70%] w-[85%]">
					<div class="flex flex-row mt-[1vh] ml-[1vh]">
						<img :src="`/avatar/${message.user.avatar_filename}`"
							class="w-[6vh] h-[6vh] mr-[1vh] rounded-full" alt="头像" />
						<div class="flex flex-col">
							<p class="text-[2.4vh]">{{ message.user.name }}</p>
							<p class="text-[1.8vh]">发布于{{ message.create_at_format_str }}</p>
						</div>
					</div>
					<p class="m-[1vh]">{{ message.content }}</p>
				</div>
			</div>
			<div class="w-[10%] h-[5vh] border-[#000000] flex flex-row items-center justify-center rounded-full border font-['SYST']">
				更多留言
			</div>
		</div>
		<div class="my-[3vh] flex flex-col justify-center md:w-[70%] w-[85%]">
			<div class="mb-[3vh] relative">
				<p class="absolute pointer-events-none px-[1vh] duration-700 z-50" :class="{'text-[#FFFFFF]':style_mode,'bg-black':style_mode,'text-[1.8vh]':style_mode,'top-[-1.2vh]':style_mode,'left-[1.4vh]':style_mode,
            'text-[#000000]':!style_mode,'bg-white':!style_mode,'text-[2.2vh]':!style_mode,'top-[1vh]':!style_mode,'left-[1vh]':!style_mode}
            ">
					你是我一生只会遇见一次的惊喜...
				</p>
				<textarea id="pl" type="text" class="w-full h-[20vh] p-[2vh] border border-[#000000] min-h-[20vh]"
					v-model="value" @focus="onFocus" @blur="onBlur"></textarea>
			</div>
			<div class="w-full flex flex-row justify-around">
				<button @click="publish_message" :disabled="buttonDisabled"
					class="w-[20%] h-[5vh] border border-[#000000] rounded-full disabled:border-[#E1FF00]">
					发送
				</button>
				<button @click="clear" class="w-[20%] h-[5vh] border border-[#000000] rounded-full">
					清除
				</button>
			</div>
		</div>
	</div>
  <div class="h-[20px]"></div>
</template>
<style scoped>
</style>