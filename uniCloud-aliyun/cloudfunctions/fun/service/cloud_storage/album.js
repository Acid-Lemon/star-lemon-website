const {
    Service
} = require("uni-cloud-router");

const { codes } = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async get_image_upload_options(info) {
        let {filename, folder_path, group_type} = info;

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
}
