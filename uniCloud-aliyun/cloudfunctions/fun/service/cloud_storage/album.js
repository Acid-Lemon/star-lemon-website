const {
    Service
} = require("uni-cloud-router");

const { codes } = require("../../types/error");

const {
    merge_folder_path,
    get_folder_names_by_path
} = require('../../utils/common/path.js');

const {
    cloud_storage_path_prefixes
} = require("./path_prefixes");

module.exports = class Service_CloudStorage_Album extends Service {
    async get_image_upload_options(info) {
        let {filename, folder_path} = info;

        let folder = await this.service.db.album.find_folder_by_path(folder_path);
        if (!folder) {
            this.throw(codes.no_folder, "no folder exist. create first");
        }

        let image_path = folder_path + filename;
        await this.service.db.album.add_files([{
            folder_id: folder.id
        }], this.ctx.auth.user_id);

        let storage_manager = this.service.cloud_storage.general.get_manager();
        return this.service.cloud_storage.general.get_upload_file_options(storage_manager, {
            cloud_path: image_path,
            allow_update: false
        });
    }

    async create_folder(info) {
        let {
            exist_folder_path,
            new_folder_path_suffix,
            public_state
        } = info;

        if (exist_folder_path === undefined) {
            exist_folder_path = cloud_storage_path_prefixes.album;
        } else {
            let exist_folder = await this.service.db.album.find_folder_by_path(exist_folder_path);
            if (!exist_folder) {
                this.throw(codes.no_folder, `no folder ${exist_folder_path} exist. create first`);
            }
        }

        let new_folder_names = get_folder_names_by_path(new_folder_path_suffix);

        if (public_state === "shared") {
            await this.service.db.album.add_nest_shared_folders(new_folder_names, exist_folder_path);
        } else if (public_state === "public" || public_state === "private") {
            await this.service.db.album.add_nest_personal_folders(new_folder_names, exist_folder_path, this.ctx.auth.user_id, public_state);
        } else {
            this.throw(codes.invalid_args, "public_state must be share or public or private");
        }
    }
}
