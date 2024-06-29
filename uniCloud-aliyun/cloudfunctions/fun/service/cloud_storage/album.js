const {
    Service
} = require("uni-cloud-router");

const {
    merge_folder_path,
    get_folder_names_by_path
} = require('../../utils/common/path.js');

const {
    cloud_storage_path_prefixes
} = require("./path_prefixes");

const { codes } = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async create_image(info) {
        let {filename, folder_path} = info;

        let folder = await this.service.db.album.find_folder_by_path(folder_path);
        if (!folder) {
            this.throw(codes.no_folder, "no folder exist. create first");
        }

        if (folder.public_state !== "shared" && folder.owner_id !== this.ctx.auth.user_id) {
            this.throw(codes.permission_denied, "this is not your folder. permission denied");
        }

        let image_path = folder_path + filename;

        let image_id;
        if (folder.public_state === "shared") {
            image_id = await this.service.db.album.add_shared_image({
                folder_id: folder.id,
                name: filename
            });
        } else {
            image_id = await this.service.db.album.add_personal_image({
                folder_id: folder.id,
                name: filename
            }, this.ctx.auth.user_id);
        }

        return {
            image_id,
            image_path
        };
    }

    async get_image_upload_options(image_id, image_path) {
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
            exist_folder_path,
            new_folder_path_suffix,
            public_state
        } = info;

        if (exist_folder_path === undefined) {
            exist_folder_path = merge_folder_path(cloud_storage_path_prefixes.album, public_state);

            if (public_state !== "shared") {
                exist_folder_path = merge_folder_path(exist_folder_path, this.ctx.auth.user_id);
            }
        } else {
            let exist_folder = await this.service.db.album.find_folder_by_path(exist_folder_path);
            if (!exist_folder) {
                this.throw(codes.no_folder, `no folder ${exist_folder_path} exist. create first`);
            }

            public_state = exist_folder.public_state;
        }

        console.info("exist_folder_path:", exist_folder_path ?? null);
        console.info("new_folder_path_suffix:", new_folder_path_suffix);
        console.info("public_state:", public_state);

        let new_folder_names = get_folder_names_by_path(new_folder_path_suffix);

        if (public_state === "shared") {
            return await this.service.db.album.add_nest_shared_folders(new_folder_names, exist_folder_path);
        } else {
            return await this.service.db.album.add_nest_personal_folders(new_folder_names, exist_folder_path, this.ctx.auth.user_id, public_state);
        }
    }
}
