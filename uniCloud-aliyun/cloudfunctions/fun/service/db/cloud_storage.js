const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    path_slash_format,
    get_folder_depth,
    marge_path
} = require("../../utils/common/path");

module.exports = class DBService_CloudStorage extends Service {
    async add_folders(folders_info) {
        let now_time = Date.now();
        return await this.db.collection(tables.cloud_storage).add(folders_info.map((info) => {
            return {
                prefix_path: path_slash_format(info.prefix_path, "folder"),
                folder_name: info.folder_name,
                depth: get_folder_depth(marge_path(info.prefix_path, info.folder_name)),
                owner: info.owner ?? null,
                type: "folder",
                create_at: now_time
            }
        }));
    }

    async add_files(files_info, folder_id) {
        let now_time = Date.now();
        return await this.db.collection(tables.cloud_storage).add(files_info.map((info) => {
            return {
                file_name: info.file_name,
                folder_id: folder_id,
                owner: info.owner ?? null,
                type: "file",
                create_at: now_time
            };
        }));
    }
}
