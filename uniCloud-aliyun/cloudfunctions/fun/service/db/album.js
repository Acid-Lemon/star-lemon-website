const {
    Service
} = require("uni-cloud-router");

const {
    tables
} = require("./tables");

const {
    convert_time_range
} = require("../../utils/db/compose_select_command");

const {
    id_name_format
} = require("../../utils/db/result_format");

const {
    codes
} = require("../../types/error");

module.exports = class Service_CloudStorage_Album extends Service {
    async add_shared_folder(folder_name, creator_id) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_shared_folder_exist(folder_name)) {
                this.throw(codes.err_folder_exist, `shared folder ${folder_name} already exists`)
            }

            let res = await transaction.collection(tables.album).add({
                type: "folder",
                name: folder_name,
                creator_id,
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

    async add_shared_image(folder_id, image_name, user_id) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_image_exist(folder_id, image_name)) {
                this.throw(codes.exist_image, "image already exist");
            }

            let image_id = (await transaction.collection(tables.album).add({
                type: "image",
                folder_id,
                name: image_name,
                creator_id: user_id,
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
                this.throw(codes.err_image_create, "image create error");
            }
        }
    }

    async add_personal_image(folder_id, image_name) {
        let transaction = await this.db.startTransaction();
        try {
            if (await this.service.db.album.check_image_exist(folder_id, image_name)) {
                this.throw(codes.exist_image, "image already exist");
            }

            let image_id = (await transaction.collection(tables.album).add({
                type: "image",
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
                this.throw(codes.err_image_create, "image create error");
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

    async find_shared_folders() {
        return (await this.db.collection(tables.album).aggregate()
            .match({
                type: "folder",
                public_state: "shared"
            })
            .sort({
                create_at: -1
            })
            .lookup({
                from: tables.user,
                let: {
                    creator_id: "$creator_id"
                },
                pipeline: this.db.command.aggregate.pipeline()
                    .match(this.db.command.expr(this.db.command.
                        eq(["$_id", "$$creator_id"])
                    ))
                    .project({
                        id: "$_id",
                        _id: false,
                        name: true,
                        avatar: true
                    })
                    .done(),
                as: "creator"
            })
            .project({
                id: "$_id",
                _id: false,
                name: true,
                creator: this.db.command.aggregate.arrayElemAt(["$creator", 0]),
                create_at: true
            })
            .end())
            .data;
    }

    async find_public_folders() {
        return (await this.db.collection(tables.album).aggregate()
            .match({
                type: "folder",
                public_state: "public"
            })
            .sort({
                create_at: -1
            })
            .lookup({
                from: tables.user,
                let: {
                    owner_id: "$owner_id"
                },
                pipeline: this.db.command.aggregate.pipeline()
                    .match(this.db.command.expr(this.db.command.
                        eq(["$_id", "$$owner_id"])
                    ))
                    .project({
                        id: "$_id",
                        _id: false,
                        name: true,
                        avatar: true
                    })
                    .done(),
                as: "owner"
            })
            .project({
                id: "$_id",
                _id: false,
                name: true,
                owner: this.db.command.aggregate.arrayElemAt(["$owner", 0]),
                create_at: true
            })
            .end())
            .data;
    }

    async find_private_folders(owner_id) {
        return (await this.db.collection(tables.album).aggregate()
            .match({
                type: "folder",
                owner_id,
                public_state: "private"
            })
            .sort({
                create_at: -1
            })
            .lookup({
                from: tables.user,
                let: {
                    owner_id: "$owner_id"
                },
                pipeline: this.db.command.aggregate.pipeline()
                    .match(this.db.command.expr(this.db.command.
                        eq(["$_id", "$$owner_id"])
                    ))
                    .project({
                        id: "$_id",
                        _id: false,
                        name: true,
                        avatar: true
                    })
                    .done(),
                as: "owner"
            })
            .project({
                id: "$_id",
                _id: false,
                name: true,
                owner: this.db.command.aggregate.arrayElemAt(["$owner", 0]),
                create_at: true
            })
            .end())
            .data;
    }

    async find_shared_images(folder_id, image_number, time_range={}, skip_number=0) {
        let { time_sort_direction, create_at_match_obj } = convert_time_range(time_range);

        return id_name_format((await this.db.collection(tables.album).where({
            type: "image",
            folder_id,
            ...create_at_match_obj
        })  .skip(skip_number)
            .limit(image_number)
            .field({
                id: true,
                name: true,
                creator_id: true,
                create_at: true
            })
            .orderBy("create_at", time_sort_direction === 1 ? "asc" : "desc")
            .get()).data);
    }

    async find_personal_images(folder_id, image_number, time_range={}, skip_number=0) {
        let { time_sort_direction, create_at_match_obj } = convert_time_range(time_range);

        return id_name_format((await this.db.collection(tables.album).where({
            type: "image",
            folder_id,
            ...create_at_match_obj
        })  .skip(skip_number)
            .limit(image_number)
            .field({
              id: true,
              name: true,
              create_at: true
            })
            .orderBy("create_at", time_sort_direction === 1 ? "asc" : "desc")
            .get()).data);
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
            type: "image",
            folder_id,
            name: image_name
        }).count()).total);
    }

    async delete_image_by_id(image_id) {
        await this.db.collection(tables.album).doc(image_id).remove();
    }
}
