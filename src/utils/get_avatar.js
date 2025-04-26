import {ElNotification} from "element-plus";

import {call_api} from "@/src/utils/cloud";
import {caching_avatar, get_cache_avatar} from "./indexedDB";

async function get_avatar(avatar) {
    if (!avatar?.type || !(avatar?.name || avatar?.url)) {
        return null;
    }

    // 直接有第三方头像链接
    if (avatar.type === "url") {
        return avatar.url;
    }

    // 本地头像
    if (avatar.type === "local") {
        return "/static/avatar/" + avatar.name;
    }

    // 在缓存中寻找头像
    let cache_avatar = await get_cache_avatar(avatar.name);
    console.log(cache_avatar);
    if (cache_avatar) {
        console.log("从缓存中获取头像: " + avatar.name);
        return cache_avatar;
    }

    // 在对象存储中获取头像
    let avatar_url_res = await call_api("user/profile/get_upload_avatar_temp_url", {
        image_name: avatar.name
    });

    if (!avatar_url_res.success) {
        ElNotification({
            title: 'Error',
            message: avatar_url_res,
            type: 'error',
        });
        console.error(avatar_url_res);
        return null;
    }

    await caching_avatar(avatar.name, avatar_url_res.data.temp_url);

    console.log("从对象存储中获取头像: " + avatar.name);
    return avatar_url_res.data.temp_url
}

export {
    get_avatar
}
