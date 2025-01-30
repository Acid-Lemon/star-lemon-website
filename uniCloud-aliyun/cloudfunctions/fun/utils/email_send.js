const nodemailer = require("nodemailer");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const transporter = nodemailer.createTransport({
    host: config["EMAIL_CODE_SENDER"]["host"],
    port: config["EMAIL_CODE_SENDER"]["port"],
    secure: config["EMAIL_CODE_SENDER"]["port"] === 465, // true for port 465, false for other ports
    auth: {
        user: config["EMAIL_CODE_SENDER"]["email"],
        pass: config["EMAIL_CODE_SENDER"]["password"],
    },
});

async function send_email_code(to_email, code, mode) {
    return await transporter.sendMail({
        from: `"Star⭐和lemon🍋" <${config["EMAIL_CODE_SENDER"]["email"]}>`,
        to: to_email,
        subject: "Hello ✔",
        text: "Hello world?",
        html: `<b>${code}</b>`,
    });
}

module.exports = {
    send_email_code
}
