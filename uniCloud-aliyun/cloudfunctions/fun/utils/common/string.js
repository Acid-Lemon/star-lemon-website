function remove_start_string(str, start_str) {
    if (!str.startsWith(start_str)) {
        throw new Error(`remove_start_str: string ${str} is not start with ${start_str}`);
    }

    return str.substring(start_str.length);
}

function count_char(str, c) {
    let cnt = 0;

    for (let i of str) {
        if (i === c) {
            cnt++;
        }
    }

    return cnt;
}

module.exports = {
    count_char,
    remove_start_string
}
