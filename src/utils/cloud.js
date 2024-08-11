import {store_token, get_token} from "@/src/utils/user_info";

async function call_api(action, args = {}) {
	let token = get_token();

	return await uniCloud.callFunction({
		name: "fun",
		data: {
			action,
			args,
			token
		}
	}).then(async ({result: res}) => {
		let api_res = {
			...res,
			api_call_success: true
		};
		if (api_res.success && api_res.hasOwnProperty("token")) {
			await store_token(api_res.token);
		}
		return api_res;
	}).catch(err => {
	    console.log("error:", err);
	    return {
	        success: false,
	        api_call_success: false,
	        error_message: "网络错误"
	    };
	});
}

export {
	call_api
}
