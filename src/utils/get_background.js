import {ElNotification} from "element-plus";

import {call_api} from "@/src/utils/cloud";

import {caching_background, get_cache_background} from "./indexedDB";

async function get_background(background) {

    // 在缓存中寻找背景
    let cache_background = await get_cache_background(background.name);
    console.log(cache_background);
    if (cache_background) {
        console.log("从缓存中获取背景: " + background.name);
        return cache_background;
    }

    let background_url_res = await call_api("user/profile/get_upload_background_image_temp_url", {
        image_name: background.name,
    });

    if (!background_url_res.success) {
        ElNotification({
            title: 'Error',
            message: background_url_res,
            type: 'error',
        });
        console.error(background_url_res);
        return null;
    }

    await caching_background(background.name, background_url_res.data.temp_url);

    console.log("从对象存储中获取背景: " + background.name);
    return background_url_res.data.temp_url
}

export {
    get_background
}
