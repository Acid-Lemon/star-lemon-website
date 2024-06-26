const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../../utils/args_check");

module.exports = class Controller_Album extends Controller {
    /*
         filename:      文件名  名字.拓展名
         *path_prefix:  图片上传路径(/album后的路径)前缀
         group_type:    图片上传分组类型, 都为创建人享有
         - share   公开共享人人可编辑
         - public  公开查看仅自己可编辑
    */
    async get_image_upload_options() {
        let {
            filename,
            path_prefix,
            group_type
        } = validate(this.ctx.event.args, {
            filename: {
                type: "string",
                regex: /^[\w._\-\u4e00-\u9fff]*?(?<![\/\\])\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i
            },
            path_prefix: {
                type: "string",
                regex: /^[a-zA-Z0-9_.\\/\-\u4e00-\u9fff]+$/
            },
            group_type: {
                type: "string",
                within: ["share", "public", "private"]
            }
        });

        switch (group_type) {
            case "share":
            default:
        }
    }
}
