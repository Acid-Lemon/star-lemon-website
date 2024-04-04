import {
	call_api
} from "@/src/utils/cloud";

function store_user(user) {
	localStorage.setItem("user", JSON.stringify(user));
}

async function load_user() {
	let res = await call_api("getUser");
	if (!res.success) {
		throw new Error(res.error_message);
	}

	store_user(res.data.user);
}

function get_user() {
	let info = localStorage.getItem("user")
	if (info) {
		return JSON.parse(info);
	}

	let token = localStorage.getItem("token");
	if (!token) {
		return null;
	}

	load_user().then(() => {
		return localStorage.getItem("user");
	});
}

export {
	store_user,
	load_user,
	get_user
}