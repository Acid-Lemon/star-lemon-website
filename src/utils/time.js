function date_format(date) {
    let year_str = date.getFullYear() + '年';
    let month_str = (date.getMonth() + 1).toString().padStart(2, '0') + '月';
    let day_str = date.getDate().toString().padStart(2, '0') + '日 ';
    let hour_str = date.getHours().toString().padStart(2, '0') + ':';
    let minute_str = date.getMinutes().toString().padStart(2, '0') + ':';
    let second_str = date.getSeconds().toString().padStart(2, '0');
    return year_str + month_str + day_str + hour_str + minute_str + second_str;
}

export {
    date_format
}
