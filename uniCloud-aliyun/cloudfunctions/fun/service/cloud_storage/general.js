const {
    Service
} = require("uni-cloud-router");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const {
    path_slash_format
} = require('../../utils/common/path.js');

module.exports = class Service_CloudStorage extends Service {
    get_manager() {
        return uniCloud.getExtStorageManager({
            provider: "qiniu",
            domain: config["UNICLOUD_EXT_STORAGE_DOMAIN"]
        });
    }

    create_folders(path_prefix, folders_path) {
        path_prefix = path_slash_format(path_prefix);
        folders_path = path_slash_format(folders_path);

        let folder_name_arr = folders_path.split('/').filter((item) => {
            return item !== "";
        });
    }
}

