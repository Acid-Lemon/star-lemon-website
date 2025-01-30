const {
    Service
} = require("uni-cloud-router");

const {
    cloud_storage_path_prefixes
} = require("./path_prefixes");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

module.exports = class Service_CloudStorage_Album extends Service {
    async get_avatar_upload_options(image_name) {
        let image_path = cloud_storage_path_prefixes.avatar + image_name;

        let storage_manager = this.service.cloud_storage.general.get_manager();
        let {exp_time, upload_file_options} = this.service.cloud_storage.general.get_upload_file_options(storage_manager, {
            cloud_path: image_path,
            allow_update: false
        });

        return {
            exp_time,
            upload_options: upload_file_options
        };
    }

    async get_profile_background_image_upload_options(image_name) {
        let image_path = cloud_storage_path_prefixes.profile_background + image_name;

        let storage_manager = this.service.cloud_storage.general.get_manager();
        let {exp_time, upload_file_options} = this.service.cloud_storage.general.get_upload_file_options(storage_manager, {
            cloud_path: image_path,
            allow_update: false
        });

        return {
            exp_time,
            upload_options: upload_file_options
        };
    }

    async get_upload_avatar_temp_url(avatar_name) {
        let file_path = cloud_storage_path_prefixes.avatar + avatar_name;

        let manager = this.service.cloud_storage.general.get_manager();
        return await this.service.cloud_storage.general.get_private_files_temp_urls(
            manager,
            [file_path],
            config["PROFILE_PHOTO_URLS_EXPIRES"]
        )[0];
    }

    async get_upload_background_image_temp_url(image_name) {
        let file_path = cloud_storage_path_prefixes.profile_background + image_name;

        let manager = this.service.cloud_storage.general.get_manager();
        return await this.service.cloud_storage.general.get_private_files_temp_urls(
            manager,
            [file_path],
            config["PROFILE_PHOTO_URLS_EXPIRES"]
        )[0];
   }

   async delete_avatar(image_name) {
        let manager = this.service.cloud_storage.general.get_manager();
        await this.service.cloud_storage.general.delete_files(manager, [cloud_storage_path_prefixes.avatar + image_name]);
   }

   async delete_background_image(image_name) {
       let manager = this.service.cloud_storage.general.get_manager();
        await this.service.cloud_storage.general.delete_files(manager, [cloud_storage_path_prefixes.profile_background + image_name]);
   }
}
