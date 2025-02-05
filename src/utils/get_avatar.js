import axios from "axios";
import {ElNotification} from "element-plus";

import {call_api} from "@/src/utils/cloud";

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

    // 头像是用户自己上传的，需要获取临时访问链接
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

    // 通过临时链接获取图片内容
    return await axios.get(avatar_url_res.data.temp_url, {
        responseType: 'blob',
        headers: {
            'Cache-Control': 'max-age=86400' // 缓存24小时
        }
    }).then(({data}) => {
        // 获取到了图片内容，生成本地临时资源访问链接
        return URL.createObjectURL(data);
    });
}

export {
    get_avatar
}
