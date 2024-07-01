const {
    Service
} = require("uni-cloud-router");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

module.exports = class Service_CloudStorage_General extends Service {
    get_manager() {
        return uniCloud.getExtStorageManager({
            provider: "qiniu",
            domain: config["UNICLOUD_EXT_STORAGE_DOMAIN"],
            bucketName: config["UNICLOUD_EXT_STORAGE_BUCKET_NAME"],
            bucketSecret: config["UNICLOUD_EXT_STORAGE_BUCKET_SECRET"]
        });

    }

    get_upload_file_options(manager, file_info) {
        return manager.getUploadFileOptions({
            cloudPath: file_info.cloud_path,
            allowUpdate: file_info.allow_update
        });
    }
}

