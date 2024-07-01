function change_id_name(result) {
    if (!result?._id) {
        return result;
    }

    result.id = result._id;
    delete result._id;
    return result;
}

function id_name_format(result) {
    if (result === undefined || result === null) {
        return result;
    }

    if (Array.isArray(result)) {
        return result.map(change_id_name);
    } else {
        return change_id_name(result);
    }
}

module.exports = {
    id_name_format
}
