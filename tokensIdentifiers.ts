export function isEndOfLine(char: string) {
    return /\s/.test(char) || char === "\n";
}

export function isWhitespace(char: string) {
    return / /.test(char) || char === "\r";
}

export function isLetter(char: string) {
    return /[a-zA-Z]/.test(char);
}

export function isDigit(char: string) {
    return /\d/.test(char);
}

export function isCommandSeparator(char: string) {
    return char === ";";
}