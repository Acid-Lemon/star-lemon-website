const {
    Service
} = require("uni-cloud-router");

const errors = require("../../types/error");

module.exports = class Service_User_Info extends Service {
    async get_profile() {
        return await this.service.db.user.find_user_by_id(this.ctx.auth.user_id).then(info => {
            if (!info) {
                return null;
            }

            delete info["hash"];

            return info;
        });
    }

    async choose_local_avatar(avatar_name) {
        let user_avatar = this.ctx.user.avatar;
        if (!user_avatar || user_avatar.type !== "local" || user_avatar.name !== avatar_name) {

            if (user_avatar) {
                let now_time = Date.now();
                let diff = now_time - user_avatar.update_at;
                if (diff < 24 * 60 * 60 * 1000) {
                    this.throw(errors.codes.rate_limit, "距离上次更改头像不足一天");
                }

                await this.service.cloud_storage.profile.delete_avatar(user_avatar.name);
            }

            await this.service.db.user.update_user(this.ctx.auth.user_id, {
                avatar: {
                    type: "local",
                    name: avatar_name,
                    update_at: Date.now()
                }
            });
        }
    }

    async create_upload_avatar(image_type) {
        let image_name = this.ctx.auth.user_id + "." + image_type;
        let upload_options = await this.service.cloud_storage.profile.get_avatar_upload_options(image_name);

        let user_avatar = this.ctx.user.avatar;
        // 如果和目前user的avatar不一致，则进行更新
        if (!user_avatar || (user_avatar.type !== "upload" || user_avatar.name !== image_name)) {
            await this.service.db.user.update_user(this.ctx.auth.user_id, {
                avatar: {
                    type: "upload",
                    name: image_name
                }
            });
        }

        return {
            upload_options
        };
    }

    async create_background_image(image_type) {
        let image_name = this.ctx.auth.user_id + "." + image_type;
        let upload_options = await this.service.cloud_storage.profile.get_profile_background_image_upload_options(image_name);

        let background_image = this.ctx.user.profile_background_image;
        // 如果和目前user的profile_background_image不一致，则进行更新
        if (!background_image || background_image.name !== image_name) {
            if (background_image) {
                let now_time = Date.now();
                let diff = now_time - background_image.update_at;
                if (diff < 24 * 60 * 60 * 1000) {
                    this.throw(errors.codes.rate_limit, "距离上次更改背景图不足一天");
                }

                await this.service.cloud_storage.profile.delete_background_image(user_avatar.name);
            }

            await this.service.db.user.update_user(this.ctx.auth.user_id, {
                profile_background_image: {
                    name: image_name,
                    update_at: Date.now()
                }
            });
        }

        return {
            upload_options
        };
    }
}
