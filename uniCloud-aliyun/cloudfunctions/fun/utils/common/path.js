function path_slash_format(str, type) {
    str = str.replace('\\', '/');
    if (type) {
        switch (type) {
            case "folder": {
                if (!str.endsWith('/')) {
                    str += '/';
                }

                break;
            }

            default: {
                throw new Error(`path_slash_format: invalid type ${type}`);
            }
        }
    }

    return str;
}

function get_folder_depth(path) {
    return path_slash_format(path).split('/').filter(item => item !== "").length;
}

function merge_folder_path(path1, path2) {
    path1 = path_slash_format(path1, "folder");
    path2 = path_slash_format(path2, "folder");

    if (path1.endsWith("/")) {
        return path1 + (path2.startsWith("/") ? path2.slice(1) : path2);
    } else {
        return path1 + (path2.startsWith("/") ? "" : "/") + path2;
    }
}

function separate_last_folder_name(folder_path) {
    folder_path = path_slash_format(folder_path, "folder");
    folder_path = folder_path.slice(0, -1);
    let last_slash_format = folder_path.lastIndexOf('/');
    return {
        path_prefix: folder_path.substring(0, last_slash_format + 1),
        folder_name: folder_path.substring(last_slash_format + 1)
    };
}

function get_folder_names_by_path(path) {
    path = path_slash_format(path, "folder");
    return path.split('/').filter(item => item !== "");
}

module.exports = {
    path_slash_format,
    get_folder_depth,
    merge_folder_path,
    separate_last_folder_name,
    get_folder_names_by_path
}
