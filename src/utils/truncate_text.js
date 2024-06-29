function truncateText(text, maxChineseLength) {
    let currentLength = 0;
    let truncatedText = '';

    for (let char of text) {
        // 检查字符是否为中文字符（通过字符的Unicode范围）
        if (char.match(/[\u4e00-\u9fff]/)) {
            currentLength += 2; // 中文字符长度加2
        } else {
            currentLength += 1; // 英文字符长度加1
        }

        if (currentLength <= maxChineseLength * 2) {
            truncatedText += char;
        } else {
            truncatedText += '...';
            break;
        }
    }

    return truncatedText;
}

export {
    truncateText
}