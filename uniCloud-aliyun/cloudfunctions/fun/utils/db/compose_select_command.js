const db = uniCloud.database();

function convert_time_range(time_range) {
    let {
        from_time,
        to_time
    } = time_range;

    let time_sort_direction = 1;
    if (from_time > to_time) {
        time_sort_direction = -1;
        [from_time, to_time] = [to_time, from_time];
    }

    let create_at_match_obj;
    if (from_time) {
        if (to_time) {
            create_at_match_obj = {
                create_at: db.command.and([
                    db.command.gte(from_time),
                    db.command.lte(to_time)
                ])
            };
        } else {
            create_at_match_obj = {
                create_at: db.command.gte(from_time)
            };
        }
    } else if (to_time) {
        create_at_match_obj = {
            create_at: db.command.lte(to_time)
        };
    } else {
        create_at_match_obj = {
            create_at: true
        };
    }

    return {
        time_sort_direction,
        create_at_match_obj
    };
}

module.exports = {
    convert_time_range
}
