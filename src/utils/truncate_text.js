function truncate_text(text, max_chinese_length) {
    let currentLength = 0;
    let current_text = '';

    for (let char of text) {
        // 检查字符是否为中文字符（通过字符的Unicode范围）
        if (char.match(/[\u4e00-\u9fff]/)) {
            currentLength += 2; // 中文字符长度加2
        } else {
            currentLength += 1; // 英文字符长度加1
        }

        if (currentLength <= max_chinese_length * 2) {
            current_text += char;
        } else {
            current_text += '...';
            break;
        }
    }

    return current_text;
}

export {
    truncate_text
}