function truncate_text(text, max_chinese_len) {
    // 分隔标准上两个英文字符与一个中文字符等价
    const max_english_len = max_chinese_len * 2;

    let text_len = text.length, english_len_sum = 0;
    for (let i = 0; i < text_len; i++) {
        // 是否是中文字符（通过字符的Unicode范围），1个英文字符对应1个english_len，1中文字符2个english_len
        let ti_english_len = text[i].match(/[\u4e00-\u9fff]/) ? 2 : 1;

        if (english_len_sum + ti_english_len > max_english_len) {
            return text.substring(0, i) + "...";
        }

        english_len_sum += ti_english_len;
    }


    return text;
}

export {
    truncate_text
}
