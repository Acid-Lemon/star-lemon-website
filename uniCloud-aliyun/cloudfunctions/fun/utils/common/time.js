function get_utc_8_date_time() {
    return new Date(new Date() + (8 * 60 * 60 * 1000));
}

function is_leap_year(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

module.exports = {
    get_utc_8_date_time,
    is_leap_year
}
