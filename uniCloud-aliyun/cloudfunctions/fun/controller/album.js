const {
    Controller
} = require("uni-cloud-router");

const {
    validate
} = require("../utils/args_check");

const {
    cloud_storage_path_prefixes
} = require("../service/cloud_storage/path_prefixes");

const {
    codes
} = require("../types/error");

module.exports = class Controller_Album extends Controller {
    async create_image() {
        let {
            filename,
            folder_path
        } = validate(this.ctx.event.args, {
            filename: {
                type: "string",
                regex: /^[\w._\-\u4e00-\u9fff]*?(?<![\/\\])\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i
            },

            folder_path: {
                type: "string",
                regex: /^[a-zA-Z0-9_.\\/\-\u4e00-\u9fff]+$/,
                start_with: cloud_storage_path_prefixes.album
            }
        });

        let {
            image_id,
            image_path
        } = await this.service.cloud_storage.album.create_image({
            filename,
            folder_path
        });

        let new_folder_ids = await this.service.cloud_storage.album.get_image_upload_options(image_id, image_path);

        return {
            data: {
                new_folder_ids
            }
        };
    }

    async create_folder() {
        let {
            exist_folder_path,
            new_folder_path_suffix,
            public_state
        } = validate(this.ctx.event.args, {
            exist_folder_path: {
                undefined_able: true,
                type: "string",
                regex: /^[a-zA-Z0-9_.\\/\-\u4e00-\u9fff]+$/,
                start_with: cloud_storage_path_prefixes.album
            },
            new_folder_path_suffix: {
                type: "string",
                regex: /^[a-zA-Z0-9_.\\/\-\u4e00-\u9fff]+$/
            },
            public_state: {
                undefined_able: true,
                type: "string",
                within: ["shared", "public", "private"]
            }
        });

        if (exist_folder_path === undefined) {
            if (public_state === undefined) {
                this.throw(codes.invalid_args, "public_state must be defined");
            }
        } else {
            if (public_state !== undefined) {
                this.throw(codes.invalid_args, "exist_folder_path is defined. public_state depends on the last folder. So must be undefined");
            }
        }


        let res = await this.service.cloud_storage.album.create_folder({
            exist_folder_path,
            new_folder_path_suffix,
            public_state
        });

        return {
            data: res
        };
    }
}
