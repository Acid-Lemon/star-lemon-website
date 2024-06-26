const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    get_folder_depth,
    merge_folder_path,
    path_slash_format,
    separate_last_folder_name
} = require('../../utils/common/path.js');

const {
    id_name_format
} = require("../../utils/db/result_format");

const {cloud_storage_path_prefixes} = require("../cloud_storage/path_prefixes");

module.exports = class Service_CloudStorage_Album extends Service {
    async add_share_folders(folders_info) {
        let time = Date.now();
        return await this.db.collection(tables.album).add(folders_info.map((folder_info) => {
            folder_info.path_prefix = path_slash_format(folder_info.path_prefix, "folder");

            return {
                type: "folder",
                path_prefix: folder_info.path_prefix,
                name: folder_info.name,
                depth: get_folder_depth(merge_folder_path(folder_info.path_prefix, folder_info.name)),
                public_state: "share",
                create_at: time
            };
        }));
    }

    async add_personal_folders(folders_info, owner_id, public_state) {
        let time = Date.now();
        return await this.db.collection(tables.album).add(folders_info.map((folder_info) => {
            folder_info.path_prefix = path_slash_format(folder_info.path_prefix, "folder");

            return {
                type: "folder",
                path_prefix: folder_info.path_prefix,
                name: folder_info.name,
                depth: get_folder_depth(merge_folder_path(folder_info.path_prefix, folder_info.name)),
                owner_id,
                public_state,
                create_at: time
            };
        }));
    }

    async add_files(files_info, owner_id){
        let time = Date.now();
        return await this.db.collection(tables.album).add(files_info.map((file_info) => {
            return {
                type: "file",
                folder_id: file_info.folder_id,
                name: file_info.name,
                owner_id,
                create_at: time
            };
        }));
    }

    async find_folder_by_path(folder_path){
        let {path_prefix, folder_name} = separate_last_folder_name(folder_path);
        return id_name_format((await this.db.collection(tables.album).where({
            type: "folder",
            path_prefix,
            name: folder_name
        }).get()).data[0]);
    }
}
