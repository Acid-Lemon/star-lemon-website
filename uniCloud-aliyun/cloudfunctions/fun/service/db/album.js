const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
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
                let full_path = merge_folder_path(loop_path_prefix, folder_name);
                if (await this.service.db.album.check_folder_exist_by_path(full_path)) {
                    this.throw(codes.err_folder_exist, `folder ${full_path} already exists`)
                }

                let res = await transaction.collection(tables.album).add({
                    type: "folder",
                    path_prefix: loop_path_prefix,
                    name: folder_name,
                    public_state: "share",
                    create_at: now_time
                });

                let new_folder_id = res.id;
                new_folder_ids.push({
                    folder_path: full_path,
                    folder_id: new_folder_id
                });

                loop_path_prefix = merge_folder_path(loop_path_prefix, folder_name);
            }

            await transaction.commit();
        } catch (err) {
            console.error(err);
            await transaction.rollback();

            if (err.customize) {
                throw err;
            } else {
                this.throw(codes.err_folder_create, "folder create error");
            }
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
                let full_path = merge_folder_path(loop_path_prefix, folder_name);
                if (await this.service.db.album.check_folder_exist_by_path(full_path)) {
                    this.throw(codes.err_folder_exist, `folder ${full_path} already exists`)
                }

                let res = await transaction.collection(tables.album).add({
                    type: "folder",
                    path_prefix: loop_path_prefix,
                    name: folder_name,
                    owner_id,
                    public_state,
                    create_at: now_time
                });

                let new_folder_id = res.id;
                new_folder_ids.push({
                    folder_path: full_path,
                    folder_id: new_folder_id
                });

                loop_path_prefix = merge_folder_path(loop_path_prefix, folder_name);
            }

            await transaction.commit();
        } catch (err) {
            console.error(err);
            await transaction.rollback();

            if (err.customize) {
                throw err;
            } else {
                this.throw(codes.err_folder_create, "folder create error");
            }
        }

        return new_folder_ids;
    }

    async add_shared_image(image_info) {
        let time = Date.now();

        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_image_exist_by_folder_id_and_name(image_info.folder_id, filename)) {
                this.throw(codes.exist_file, "image already exist");
            }

            let image_id = (await transaction.collection(tables.album).add({
                type: "file",
                folder_id: image_info.folder_id,
                name: image_info.name,
                create_at: time
            })).id;

            await transaction.commit();

            return image_id;
        } catch (err) {
            console.error(err);
            await transaction.rollback();

            if (err.customize) {
                throw err;
            } else {
                this.throw(codes.err_file_create, "file create error");
            }
        }
    }

    async add_personal_image(image_info, owner_id) {
        let time = Date.now();

        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_image_exist_by_folder_id_and_name(image_info.folder_id, image_info.name)) {
                this.throw(codes.exist_file, "image already exist");
            }

            let image_id = (await transaction.collection(tables.album).add({
                type: "file",
                folder_id: image_info.folder_id,
                name: image_info.name,
                owner_id,
                create_at: time
            })).id;

            await transaction.commit();

            return image_id;
        } catch (err) {
            console.error(err);
            await transaction.rollback();

            if (err.customize) {
                throw err;
            } else {
                this.throw(codes.err_file_create, "file create error");
            }
        }
    }

    async find_image_by_folder_id_and_name(folder_id, name) {
        return id_name_format((await this.db.collection(tables.album).where({
            type: "file",
            folder_id,
            name
        }).get()).data[0] ?? null);
    }

    async check_image_exist_by_folder_id_and_name(folder_id, name) {
        return Boolean((await this.db.collection(tables.album).where({
            type: "file",
            folder_id,
            name
        }).count()).total);
    }

    async find_folder_by_path(folder_path){
        let { path_prefix, folder_name } = separate_last_folder_name(folder_path);
        return id_name_format((await this.db.collection(tables.album).where({
            type: "folder",
            path_prefix,
            name: folder_name
        }).get()).data[0]);
    }

    async check_folder_exist_by_path(folder_path) {
        let { path_prefix, folder_name } = separate_last_folder_name(folder_path);
        return Boolean((await this.db.collection(tables.album).where({
            type: "folder",
            path_prefix,
            name: folder_name
        }).count()).total);
    }

    async delete_image_by_id(image_id) {
        await this.db.collection(tables.album).doc(image_id).remove();
    }
}
