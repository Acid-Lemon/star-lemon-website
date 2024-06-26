const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

const {
    cloud_storage_path_prefixes
} = require("../service/cloud_storage/path_prefixes");

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
            folder_path: {
                type: "string",
                regex: /^[a-zA-Z0-9_.\\/\-\u4e00-\u9fff]+$/,
                start_with: cloud_storage_path_prefixes.album
            },
            group_type: {
                type: "string",
                within: ["share", "public", "private"]
            }
        });

        return await this.service.cloud_storage.get_image_upload_options({
            filename,
            path_prefix,
            group_type
        });
    }
}
