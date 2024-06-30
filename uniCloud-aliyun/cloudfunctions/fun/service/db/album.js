const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    id_name_format
} = require("../../utils/db/result_format");

const {
    codes
} = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async add_shared_folder(folder_name) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_shared_folder_exist(folder_name)) {
                this.throw(codes.err_folder_exist, `shared folder ${folder_name} already exists`)
            }

            let res = await transaction.collection(tables.album).add({
                type: "folder",
                name: folder_name,
                public_state: "shared",
                create_at: Date.now()
            });

            await transaction.commit();

            return res.id;
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

    async add_personal_folder(folder_name, owner_id, public_state) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_personal_folder_exist(folder_name, owner_id, public_state)) {
                this.throw(codes.err_folder_exist, `${public_state} folder ${folder_name} already exists`)
            }

            let res = await transaction.collection(tables.album).add({
                type: "folder",
                name: folder_name,
                owner_id,
                public_state,
                create_at: Date.now()
            });

            await transaction.commit();

            return res.id;
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

    async add_image(folder_id, image_name) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_image_exist(folder_id, image_name)) {
                this.throw(codes.exist_file, "image already exist");
            }

            let image_id = (await transaction.collection(tables.album).add({
                type: "file",
                folder_id,
                name: image_name,
                create_at: Date.now()
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

    async find_folder_by_id(folder_id) {
        return id_name_format((await this.db.collection(tables.album).doc(folder_id).get()).data[0]);
    }

    async find_shared_folder(name){
        return id_name_format((await this.db.collection(tables.album).where({
            type: "folder",
            name,
            public_state: "shared"
        }).get()).data[0]);
    }

    async find_personal_folder(name, owner_id, public_state){
        return id_name_format((await this.db.collection(tables.album).where({
            type: "folder",
            name,
            owner_id,
            public_state
        }).get()).data[0]);
    }

    async check_shared_folder_exist(name) {
        return Boolean((await this.db.collection(tables.album).where({
            type: "folder",
            name,
            public_state: "shared"
        }).count()).total);
    }

    async check_personal_folder_exist(name, owner_id, public_state) {
        return Boolean((await this.db.collection(tables.album).where({
            type: "folder",
            name,
            owner_id,
            public_state
        }).count()).total);
    }

    async check_image_exist(folder_id, image_name) {
        return Boolean((await this.db.collection(tables.album).where({
            type: "file",
            folder_id,
            name: image_name
        }).count()).total);
    }

    async delete_image_by_id(image_id) {
        await this.db.collection(tables.album).doc(image_id).remove();
    }
}
