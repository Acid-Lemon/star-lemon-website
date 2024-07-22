const {
    Service
} = require("uni-cloud-router");

const {
    merge_folder_path,
} = require('../../utils/common/path.js');

const {
    cloud_storage_path_prefixes
} = require("./path_prefixes");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const {codes} = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async create_image(image_name, folder) {
        if (folder.public_state === "shared") {
            return await this.service.db.album.add_shared_image(folder.id, image_name, this.auth.ctx.user_id);
        } else {
            return await this.service.db.album.add_personal_image(folder.id, image_name);
        }
    }

    async get_image_upload_options(image_name, folder_name, public_state) {
        let base_path;
        if (public_state === "shared") {
            base_path = merge_folder_path(cloud_storage_path_prefixes.album, "shared");
        } else {
            base_path = merge_folder_path(merge_folder_path(cloud_storage_path_prefixes.album, public_state), this.ctx.auth.user_id);
        }

        let image_path = merge_folder_path(base_path, folder_name) + image_name;
        console.info("image_path:", image_path);

        let storage_manager = this.service.cloud_storage.general.get_manager();
        let {
            expTime: exp_time,
            uploadFileOptions: upload_file_options
        } = this.service.cloud_storage.general.get_upload_file_options(storage_manager, {
            cloud_path: image_path,
            allow_update: false
        });

        return {
            upload_file_options,
            exp_time
        };
    }

    async create_folder(info) {
        let {
            folder_name,
            public_state
        } = info;

        if (public_state === "shared") {
            return await this.service.db.album.add_shared_folder(folder_name, this.ctx.auth.user_id);
        } else {
            return await this.service.db.album.add_personal_folder(folder_name, this.ctx.auth.user_id, public_state);
        }
    }

    async get_folders(public_state) {
        switch (public_state) {
            case "shared":
                return await this.service.db.album.find_shared_folders();
            case "public":
                return await this.service.db.album.find_public_folders();
            case "private":
                return await this.service.db.album.find_private_folders(this.ctx.auth.user_id);
            default:
                throw TypeError("get_folders: public_state is invalid");
        }
    }

    async get_images(folder, image_number, time_range={}, skip_number=0) {
        let images_info;
        if (folder.public_state === "shared") {
            images_info = await this.service.db.album.find_shared_images(folder.id, image_number, time_range, skip_number);
        } else {
            images_info = await this.service.db.album.find_personal_images(folder.id, image_number, time_range, skip_number);
        }

        let manager = this.service.cloud_storage.general.get_manager();
        return images_info.map((image_info) => {
            let file_path;
            if (folder.public_state === "shared") {
                file_path = merge_folder_path(merge_folder_path(cloud_storage_path_prefixes.album, "shared"), folder.name) + image_info.name;
            } else {
                file_path = merge_folder_path(merge_folder_path(merge_folder_path(cloud_storage_path_prefixes.album, folder.public_state), this.ctx.auth.user_id), folder.name) + image_info.name;
            }

            image_info["temp_url"] = this.service.cloud_storage.general.get_private_files_temp_urls(
                manager,
                [file_path],
                config["ALBUM_PHOTO_URLS_EXPIRES"]
            )[0];

            return image_info;
        });
    }

    async check_folder_visit_access(folder) {
        if (folder.public_state === "private" && folder.owner_id !== this.ctx.auth.user_id) {
            this.throw(codes.permission_denied, "the private folder isn't yours");
        }
    }

    async check_folder_edit_access(folder) {
        if (folder.public_state === "shared") {
            return;
        }

        if (folder.owner_id !== this.ctx.auth.user_id) {
            this.throw(codes.permission_denied, "the folder isn't yours. you can't edit it");
        }
    }
}
