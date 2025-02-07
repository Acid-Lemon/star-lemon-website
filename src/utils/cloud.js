import {get_token, store_token} from "@/src/utils/user_info";
import {ElNotification} from "element-plus";
import {handle_error} from "@/src/utils/handle_error";


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
        if (!api_res.success) {
            ElNotification({
                title: "Error",
                message: handle_error(api_res.code),
                type: "error"
            })
            console.error(api_res);
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
