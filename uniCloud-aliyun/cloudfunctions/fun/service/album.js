const {
    Service
} = require("uni-cloud-router");

module.exports = class Service_Album extends Service {
    get_upload_options(cloud_path, allow_update) {
        let extStorageManager = uniCloud.getExtStorageManager({
            provider: "qiniu",
            domain: "cdn.star-lemon.top"
        });

        return extStorageManager.getUploadFileOptions({
            cloudPath: cloud_path,
            allowUpdate: allow_update,
        });
    }
}
