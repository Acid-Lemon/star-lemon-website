const error_messages = {
    err_no_user: "用户不存在",
    err_no_sms_code: "验证码不存在",
    err_no_token: "未登录账号",
    err_no_folder: "文件夹不存在",
    err_password: "密码无效",
    err_sms_code: "验证码无效",
    err_email_code: "邮箱验证码无效",
    err_phone_number: "手机号码无效",
    err_username: "用户名无效",
    err_token: "令牌无效",
    err_args: "参数无效",
    err_user_create: "用户创建失败",
    err_username_exist: "用户名已存在",
    err_send_code: "发送验证码失败",
    err_token_expire: "登陆状态已过期，请重新登录",
    err_sms_code_expire: "短信验证码已过期",
    err_email_code_expire: "邮箱验证码已过期",
    err_image_create: "图片创建失败",
    err_image_delete: "图片删除失败",
    err_folder_create: "文件夹创建失败",
    err_image_exist: "图片已存在",
    err_folder_exist: "文件夹已存在",
    err_permission_denied: "您未拥有此权限",
    err_rate_limit: "请求过于频繁，请稍后再试",
    err_serve: "未知错误",
};

export function handle_error(error_code) {
    return error_messages[error_code];
}

