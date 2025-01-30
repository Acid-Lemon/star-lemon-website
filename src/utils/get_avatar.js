import {call_api} from "@/src/utils/cloud";
import {ElNotification} from "element-plus";
import axios from "axios";
import {use_user_info_store} from "@/src/stores/userInfo";

async function get_avatar() {
    let avatar_url = null;

    const user_info_store = use_user_info_store();
    const user_info = user_info_store.user_info;
    let avatar_name = user_info?.avatar.name;
    let type = user_info?.avatar.type;
    if (avatar_name) {
        if (type === "upload") {
            let avatar_url_res = await call_api("user/profile/get_upload_avatar_temp_url", {
                image_name: avatar_name,
            });

            if (!avatar_url_res.success) {
                ElNotification({
                    title: 'Error',
                    message: avatar_url_res,
                    type: 'error',
                });
                console.log(avatar_url_res);
                return;
            } else {
                const response = await axios.get(avatar_url_res.data.temp_url, {
                    responseType: 'blob',
                    headers: {
                        'Cache-Control': 'max-age=86400', // 缓存24小时
                    },
                });
                avatar_url = URL.createObjectURL(response.data);
            }
        } else {
            avatar_url = "/static/avatar/" + avatar_name
        }
    }

    return avatar_url
}

export {
    get_avatar
}
