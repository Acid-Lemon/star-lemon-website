export default function typing_effect(element, text, delay) {
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            element.innerHTML += text[i]
        }, i * delay)
    }
}