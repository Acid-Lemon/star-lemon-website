function remove_start_string(str, start_str) {
    if (!str.startsWith(start_str)) {
        throw new Error(`remove_start_str: string ${str} is not start with ${start_str}`);
    }

    return str.substring(start_str.length);
}

module.exports = {
    remove_start_string
}
