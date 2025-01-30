const nodemailer = require("nodemailer");

const config = require("uni-config-center")({pluginId: "fun"}).config();

const transporter = nodemailer.createTransport({
    host: config["EMAIL_CODE_SENDER"]["host"],
    port: config["EMAIL_CODE_SENDER"]["port"],
    secure: config["EMAIL_CODE_SENDER"]["port"] === 465, // true for port 465, false for other ports
    auth: {
        user: config["EMAIL_CODE_SENDER"]["email"],
        pass: config["EMAIL_CODE_SENDER"]["password"]
    },
});

async function send_email_code(to_email, code, mode) {
    return await transporter.sendMail({
        from: `"Star⭐和lemon🍋" <${config["EMAIL_CODE_SENDER"]["email"]}>`,
        to: to_email,
        subject: "hello！欢迎来到star和lemon的小站! 这里是邮箱验证~",
        html: `<div style="width: 100%; height:400px; background-color: #EEEEEE; display: flex; flex-direction: row; justify-content: center; align-items: center">
                   <div style="max-width: 700px; width: 95%; height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center">
                       <div style="max-width: 700px; width: 95%; height: 50px; background-image:linear-gradient(120deg,#84fab0 0%, #8fd3f4 100%); display: flex; flex-direction: row; align-items: center">
                           <div style="color: #FFFFFF; background-color: transparent; text-shadow: 3px 3px 6px black; font-weight: bold; margin: 10px; font-size: 20px">star和lemon的小站</div>
                       </div>
                       <div style="max-width: 700px; width: 95%; height:200px; background-color: #FFFFFF">
                           <div style="margin: 10px; background-color: transparent;">⭐ 你的${mode}验证码来啦：${code}，${config["EMAIL_CODE_EXP_MINUTE"]}分钟内有效，快去填上吧！ 🍋</div>
                       </div>
                       <div style="max-width: 700px; width: 95%; height:50px; background-image:linear-gradient(120deg,#89f7fe 0%, #66a6ff 100%); display: flex; flex-direction: row; align-items: center">
                           <div style="margin: 10px; background-color: transparent;">star和lemon的小站 All Rights Reserved.</div>
                       </div>
                   </div>
               </div>`
    });
}

module.exports = {
    send_email_code
}
