import axios from "axios";
import {ElNotification} from "element-plus";

import {call_api} from "@/src/utils/cloud";
import {use_user_info_store} from "@/src/stores/userInfo";

const user_info_store = use_user_info_store();

async function get_background() {
    const user_info = user_info_store.user_info;
    if (!user_info.hasOwnProperty("profile_background_image")) {
        return null;
    }

    let background_url_res = await call_api("user/profile/get_upload_background_image_temp_url", {
        image_name: user_info.profile_background_image.name,
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

    return await axios.get(background_url_res.data.temp_url, {
        responseType: 'blob',
        headers: {
            'Cache-Control': 'max-age=604800', // 缓存一周
        },
    }).then(({data}) => {
        return URL.createObjectURL(data);
    })
}

export {
    get_background
}
