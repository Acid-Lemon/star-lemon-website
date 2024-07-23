const {
    Controller
} = require("uni-cloud-router");

const {
    validate,
    validate_time_range
} = require("../utils/args_check");

const {
    codes
} = require("../types/error");

module.exports = class Controller_Album extends Controller {
    async create_image() {
        let {
            folder_id,
            image_name
        } = validate(this.ctx.event.args, {
            folder_id: {
                type: "string"
            },

            image_name: {
                type: "string",
                regex: /^[\w._\-\u4e00-\u9fff]*?(?<![\/\\])\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i
            }
        });

        let folder = await this.service.db.album.find_folder_by_id(folder_id);
        if (!folder) {
            this.throw(codes.no_folder, "folder_id invalid");
        }

        await this.service.cloud_storage.album.check_folder_edit_access(folder);

        await this.service.cloud_storage.album.create_image(image_name, folder);

        let {exp_time, upload_file_options} = await this.service.cloud_storage.album.get_image_upload_options(image_name, folder.name, folder.public_state);

        return {
            data: {
                exp_time,
                upload_file_options
            }
        };
    }

    async create_folder() {
        let {
            folder_name,
            public_state
        } = validate(this.ctx.event.args, {
            folder_name: {
                type: "string",
                regex: /^[a-zA-Z0-9_.\-\u4e00-\u9fff]+$/
            },
            public_state: {
                type: "string",
                within: ["shared", "public", "private"]
            }
        });

        let folder_id = await this.service.cloud_storage.album.create_folder({
            folder_name,
            public_state
        });

        return {
            data: {
                folder_id
            }
        };
    }

    async get_folders() {
        let {
            public_state
        } = validate(this.ctx.event.args, {
            public_state: {
                type: "string",
                within: ["shared", "public", "private"]
            }
        });

        let folders_info = await this.service.cloud_storage.album.get_folders(public_state);

        return {
            data: {
                folders_info
            }
        };
    }

    async get_images() {
        let {
            folder_id,
            time_range,
            image_number,
            skip_number = 0
        } = validate(this.ctx.event.args, {
            folder_id: {
                type: "string"
            },

            time_range: {
                undefined_able: true,
                null_able: true,
                type: "object"
            },

            image_number: {
                type: "number",
                math: {
                    min: 1,
                    max: 20
                }
            },

            skip_number: {
                undefined_able: true,
                null_able: true,
                type: "number",

                math: {
                    min: 0,
                    max: 200
                }
            }
        });

        validate_time_range(time_range);

        let folder = await this.service.db.album.find_folder_by_id(folder_id);
        if (!folder) {
            this.throw(codes.no_folder, "folder_id invalid");
        }

        await this.service.cloud_storage.album.check_folder_visit_access(folder);

        let images_info = await this.service.cloud_storage.album.get_images(folder, image_number, time_range, skip_number);

        return {
            data: {
                images_info
            }
        };
    }
}
