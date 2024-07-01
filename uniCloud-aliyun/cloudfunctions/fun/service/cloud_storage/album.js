const {
    Service
} = require("uni-cloud-router");

const {
    merge_folder_path,
} = require('../../utils/common/path.js');

const {
    cloud_storage_path_prefixes
} = require("./path_prefixes");

const {codes} = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async create_image(info) {
        let {image_name, folder_id} = info;

        return await this.service.db.album.add_image(folder_id, image_name);
    }

    async get_image_upload_options(image_name, public_state) {
        let base_path;
        if (public_state === "shared") {
            base_path = merge_folder_path(cloud_storage_path_prefixes.album, "shared");
        } else {
            base_path = merge_folder_path(merge_folder_path(cloud_storage_path_prefixes.album, public_state), this.ctx.auth.user_id);
        }

        let image_path = base_path + image_name;
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
            return await this.service.db.album.add_shared_folder(folder_name);
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

    async get_images(folder_id, image_number, start_time) {
        return start_time ? await this.service.db.album.find_images(folder_id, image_number, start_time) :
                            await this.service.db.album.find_images(folder_id, image_number);
    }

    async check_folder_visit_access(folder_id) {
        let folder = await this.service.db.album.find_folder_by_id(folder_id);
        if (!folder) {
            this.throw(codes.no_folder, "folder_id invalid");
        }

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
