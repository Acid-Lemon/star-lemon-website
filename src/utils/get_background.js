import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import axios from "axios";
import {use_user_info_store} from "@/src/stores/userInfo";

async function get_background() {
    let background_url = null;

    const user_info_store = use_user_info_store();
    const user_info = user_info_store.user_info;
    let background_name = user_info?.profile_background_image?.name;

    if (background_name) {
        let background_url_res = await call_api("user/profile/get_upload_background_image_temp_url", {
            image_name: background_name,
        });

        if (!background_url_res.success) {
            ElNotification({
                title: 'Error',
                message: background_url_res,
                type: 'error',
            });
            console.log(background_url_res);
            return;
        } else {
            const response = await axios.get(background_url_res.data.temp_url, {
                responseType: 'blob',
                headers: {
                    'Cache-Control': 'max-age=604800', // 缓存一周
                },
            });
            background_url = URL.createObjectURL(response.data);
        }
    }

    return background_url
}

export {
    get_background
}
