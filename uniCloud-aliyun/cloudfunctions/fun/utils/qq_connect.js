const errors = require("../types/api_error");

async function get_access_token_by_code(info) {
    let {data} = await uniCloud.request({
        url: "https://graph.qq.com/oauth2.0/token",
        method: "GET",
        data: {
            grant_type: 'authorization_code',
            client_id: info["app_id"],
            client_secret: info["app_key"],
            code: info["auth_code"],
            redirect_uri: info["redirect_uri"],
            fmt: "json"
        },
        dataType: "json",
        timeout: 3000
    });

    if (data.code !== 0) {
        console.error("qq connect: get access token error:", data);
        this.throw(errors.codes.err_qq_connect_login);
    }

    return data.access_token;
}

async function get_user_openid(access_token) {
    let {data} = await uniCloud.request({
        url: "https://graph.qq.com/oauth2.0/me",
        method: "GET",
        data: {
            access_token: access_token,
        },
        dataType: "json",
        timeout: 3000
    });

    if (data.code !== 0) {
        console.error("qq connect: get access token error:", data);
        this.throw(errors.codes.err_qq_connect_login);
    }

    return data.openid;
}

async function get_user_info(access_token, app_id, openid) {
    let {data} = await uniCloud.request({
        url: "https://graph.qq.com/user/get_user_info",
        method: "GET",
        data: {
            access_token: access_token,
            oauth_consumer_key: app_id,
            openid: openid
        },
        dataType: "json",
        timeout: 3000
    });

    if (data.ret < 0) {
        console.error("qq connect: get user info error:", data);
        this.throw(errors.codes.err_qq_connect_login);
    }

    return {
        avatar_url: data["figureurl_qq_1"],
        nickname: data["nickname"]
    };
}

module.exports = {
    get_access_token_by_code,
    get_user_openid,
    get_user_info
}
