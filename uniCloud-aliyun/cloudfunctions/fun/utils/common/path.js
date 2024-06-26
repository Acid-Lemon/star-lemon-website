function path_slash_format(str, type) {
    str = str.replace('\\', '/');
    switch (type) {
        case "folder":
            if (!str.endsWith('/')) {
                str += '/';
            }
    }

    return str;
}

function get_folder_depth(path) {
    return path_slash_format(path).split('/').filter(item => item !== "").length;
}

function marge_path(path1, path2) {
    path1 = path_slash_format(path1);
    path2 = path_slash_format(path2);
    if (path1.endsWith("/")) {
        return path1 + path2;
    } else {
        return path1 + "/" + path2;
    }
}

module.exports = {
    path_slash_format,
    get_folder_depth,
    marge_path
}
