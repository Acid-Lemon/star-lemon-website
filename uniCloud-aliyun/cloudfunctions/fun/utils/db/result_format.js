function id_name_format(result) {
    if (!result._id) {
        return result;
    }

    result.id = result._id;
    delete result._id;
    return result;
}

module.exports = {
    id_name_format
}
