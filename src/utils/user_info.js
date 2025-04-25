import {call_api} from "@/src/utils/cloud";
import {use_user_info_store} from "../stores/userInfo";

function store_token(token) {
    uni.setStorageSync("token", token);
}

function get_token() {
    return uni.getStorageSync("token");
}

function store_user(user) {
    uni.setStorageSync("user", user);
    const user_infoStore = use_user_info_store();
    user_infoStore.user_info = user;
}

function store_avatar_url(avatar_url) {
    const user = uni.getStorageSync("user");
    user.avatar.url = avatar_url;

    store_user(user);
}

function store_background_url(background_url) {
    const user = uni.getStorageSync("user");
    user.background.url = background_url;

    store_user(user);
}

async function load_user() {
    let res = await call_api("user/profile/get_profile");
    if (!res.success) {
        throw new Error(res.error_message);
    }

    if (!Object.keys(res.data.profile).length) {
        return;
    }

    store_user(res.data.profile);
}

async function get_user() {
    let info = uni.getStorageSync("user");
    if (info) {
        return info;
    }

    let token = get_token();
    if (!token) {
        return null;
    }

    await load_user();

    return uni.getStorageSync("user");
}

export {
    store_user,
    load_user,
    get_user,
    store_token,
    get_token,
    store_avatar_url,
    store_background_url
}
