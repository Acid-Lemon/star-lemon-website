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
        let {
            expTime: exp_time,
            uploadFileOptions: upload_file_options
        } = manager.getUploadFileOptions({
            cloudPath: file_info.cloud_path.slice(1),
            allowUpdate: file_info.allow_update
        });

        return {
            exp_time,
            upload_file_options
        };
    }

    async change_file_public_state(manager, file_path, new_state) {
        let res = await extStorageManager.updateFileStatus({
            fileID: `qiniu://${file_path.slice(1)}`,
            isPrivate: new_state === "private"
        });

        if (res.code !== 0) {
            throw res;
        }
    }

    get_private_files_temp_urls(manager, file_paths, expires=3600) {
        file_paths = file_paths.map((file_path) => {
            return file_path.slice(1);
        });

        let file_list = manager.getTempFileURL({
            fileList: file_paths,
            expiresIn: expires
        }).fileList;

        return file_list.map((temp_url_info) => {
            return temp_url_info.tempFileURL;
        });
    }

    async delete_files(manager, file_paths) {
        file_paths = file_paths.map((file_path) => {
            return file_path.slice(1);
        });

        let res = await manager.deleteFile({
            fileList: file_paths
        });

        console.info("delete file:", res);
    }
}


