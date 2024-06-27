const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    get_folder_depth,
    merge_folder_path,
    separate_last_folder_name
} = require('../../utils/common/path.js');

const {
    id_name_format
} = require("../../utils/db/result_format");

const {
    codes
} = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async add_nest_shared_folders(folder_names, path_prefix) {
        let now_time = Date.now();

        let new_folder_ids = [];
        let transaction = await this.db.startTransaction();
        try {
            let loop_path_prefix = path_prefix;
            for (let folder_name of folder_names) {
                let res = await transaction.collection(tables.album).add({
                    type: "folder",
                    path_prefix: loop_path_prefix,
                    name: folder_name,
                    public_state: "share",
                    create_at: now_time
                });

                let new_folder_id = res.data;
                new_folder_ids.push(new_folder_id);

                loop_path_prefix = merge_folder_path(loop_path_prefix, folder_name);
            }

            await transaction.commit();
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            this.throw(codes.err_folder_create, "folder create error");
        }

        return new_folder_ids;
    }

    async add_nest_personal_folders(folder_names, path_prefix, owner_id, public_state) {
        let now_time = Date.now();

        let new_folder_ids = [];
        let transaction = await this.db.startTransaction();
        try {
            let loop_path_prefix = path_prefix;
            for (let folder_name of folder_names) {
                let res = await transaction.collection(tables.album).add({
                    type: "folder",
                    path_prefix: loop_path_prefix,
                    name: folder_name,
                    owner_id,
                    public_state,
                    create_at: now_time
                });

                let new_folder_id = res.data;
                new_folder_ids.push(new_folder_id);

                loop_path_prefix = merge_folder_path(loop_path_prefix, folder_name);
            }

            await transaction.commit();
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            this.throw(codes.err_folder_create, "folder create error");
        }

        return new_folder_ids;
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
