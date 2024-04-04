import {
	call_api
} from "@/src/utils/cloud";

function store_token(token) {
	uni.setStorageSync("token", token);
}

function store_user(user) {
	uni.setStorageSync("user", user);
}

async function load_user() {
	let res = await call_api("user/info/get");
	if (!res.success) {
		throw new Error(res.error_message);
	}

	store_user(res.data.user);
}

function get_user() {
	let info = uni.getStorageSync("user");
	if (info) {
		return info;
	}

	let token = uni.getStorageSync("token");
	if (!token) {
		return null;
	}

	load_user().then(() => {
		return uni.getStorageSync("user");
	});
}

export {
	store_user,
	load_user,
	get_user,
	store_token
}
