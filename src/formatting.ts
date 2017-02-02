export interface IFormatConfig {
    tabSize: number;
    sortUsingsSystemFirst: boolean;
    emptyLinesInRowLimit: number;
    indentEnabled: boolean;
    indentPreprocessor: boolean;
}

export interface IResult {
    source?: string;
    error?: string;
}

interface IIndenter {
    line: number;
    indentLevel: number;
    open: string;
}

const indentClosePairs = {
    '{': '}',
    '(': ')',
    '[': ']',
    '=': ';',
};

const assignInvalidChars = '<>=!';

const getIndent = (amount: number, tabSize: number): string => {
    return ' '.repeat(tabSize * (amount > 0 ? amount : 0));
};

const _indenters: IIndenter[] = [];

const clearIndenters = (): void => {
    _indenters.length = 0;
};

const pushIndenter = (indenter: IIndenter): void => {
    _indenters.push(indenter);
};

const popIndenter = (): IIndenter | undefined => {
    return _indenters.length > 0 ? _indenters.pop() : undefined;
};

export const process = (content: string, options: IFormatConfig): IResult => {
    clearIndenters();
    const input = content.split('\n');
    const usingRegex = /^using \w+[\.\w]*;/;
    const StringRegex = /"[^\\"]*(?:\\.[^\\"]*)*"/g;
    const CharRegex = /'[^\\']*(?:\\.[^\\']*)*'/g;
    const SwitchCaseRegex = /(case\s[^:]+|default[\s]*):/;
    const SwitchBreakRegex = /break|return[^;]*;/;
    const usings = [];
    const output = [];
    let indentLevel = 0;
    let indent = getIndent(indentLevel, options.tabSize);
    let nextIndentLevel: number;
    let isIndentDirty: boolean;
    let emptyLinesCount = 0;
    let assignLevel = 0;
    let mlCommentOpened = false;
    let switchLevel = 0;

    for (let lineId = 0; lineId < input.length; lineId++) {
        const rawLine = input[lineId];
        const trimmedLine = rawLine.trim();
        let noStringsLine = trimmedLine.replace(StringRegex, '""').replace(CharRegex, '\'\'');
        // comments processing.
        let mlCommentStart = noStringsLine.indexOf('/*');
        const mlCommentEnd = noStringsLine.indexOf('*/');
        let slCommentStart = noStringsLine.indexOf('//');
        if (mlCommentOpened) {
            if (mlCommentEnd !== -1) {
                noStringsLine = noStringsLine.substr(mlCommentEnd + 1);
                mlCommentOpened = false;
            } else {
                // we are inside multiline comment.
                noStringsLine = '';
            }
        }
        if (!mlCommentOpened && (mlCommentStart !== -1 || slCommentStart !== -1)) {
            if (mlCommentStart === -1) {
                mlCommentStart = Number.MAX_SAFE_INTEGER;
            }
            if (slCommentStart === -1) {
                slCommentStart = Number.MAX_SAFE_INTEGER;
            }
            if (mlCommentStart < slCommentStart) {
                mlCommentOpened = true;
                noStringsLine = noStringsLine.substr(0, mlCommentStart);
            } else {
                noStringsLine = noStringsLine.substr(0, slCommentStart);
            }
        }
        // sort usings.
        if (usingRegex.test(noStringsLine)) {
            let usingExpr = noStringsLine.match(usingRegex)[0];
            if (noStringsLine.length > usingExpr.length) {
                const endLine = noStringsLine.substr(usingExpr.length).trim();
                if (endLine.length > 0) {
                    input.splice(lineId + 1, 0, endLine);
                }
            }
            usingExpr = usingExpr.substr(0, usingExpr.length - 1);
            if (usings.indexOf(usingExpr) === -1) {
                usings.push(usingExpr);
            }
            emptyLinesCount = 0;
            continue;
        }
        if (usings.length > 0) {
            usings.sort((a: string, b: string) => {
                let res = 0;
                if (options.sortUsingsSystemFirst) {
                    if (a.indexOf('System') === 6) { res--; }
                    if (b.indexOf('System') === 6) { res++; }
                    if (res !== 0) {
                        return res;
                    }
                }
                for (let i = 0; i < a.length; i++) {
                    const lhs = a[i].toLowerCase();
                    const rhs = b[i] ? b[i].toLowerCase() : b[i];
                    if (lhs !== rhs) {
                        res = lhs < rhs ? -1 : 1;
                        break;
                    }
                    if (lhs !== a[i]) { res++; }
                    if (rhs !== b[i]) { res--; }
                    if (res !== 0) {
                        break;
                    }
                }
                if (res === 0 && b.length > a.length) {
                    return -1;
                }
                return res;
            });
            for (let i = 0; i < usings.length; i++) {
                output.push(`${indent}${usings[i]};`);
            }
            usings.length = 0;
        }

        // emptyLinesInRowLimit option processing.
        if (trimmedLine.length === 0) {
            if (options.emptyLinesInRowLimit >= 0) {
                if (emptyLinesCount >= options.emptyLinesInRowLimit) {
                    continue;
                }
                emptyLinesCount++;
            }
        } else {
            emptyLinesCount = 0;
        }

        // indentEnabled option processing.
        if (!options.indentEnabled) {
            output.push(rawLine);
            continue;
        }
        if (noStringsLine[0] === '}' || noStringsLine[0] === ')') {
            indentLevel = Math.max(0, indentLevel - 1);
            indent = getIndent(indentLevel, options.tabSize);
            output.push(`${indent}${trimmedLine}`);
        } else {
            if (!options.indentPreprocessor && noStringsLine[0] === '#') {
                if (noStringsLine.indexOf('#region') !== 0 &&
                    noStringsLine.indexOf('#endregion') !== 0) {
                    // preprocessor without indentation.
                    output.push(trimmedLine);
                } else {
                    output.push(`${indent}${trimmedLine}`);
                }
            } else {
                output.push(`${indent}${trimmedLine}`);
            }
        }

        nextIndentLevel = indentLevel;

        if (SwitchCaseRegex.test(noStringsLine)) {
            // hack: check next case line for fall through behaviour.
            if (lineId < (input.length - 1)) {
                const nextNoStringsLine = input[lineId + 1].trim().replace(StringRegex, '""').replace(CharRegex, '\'\'');
                if (!SwitchCaseRegex.test(nextNoStringsLine)) {
                    switchLevel++;
                    nextIndentLevel++;
                }
            }
        }
        if (switchLevel > 0 && SwitchBreakRegex.test(noStringsLine)) {
            switchLevel--;
            nextIndentLevel--;
        }

        let indented = 0;
        let oldIndent: IIndenter;
        for (let c = 0; c < noStringsLine.length; c++) {
            const ch = noStringsLine[c];
            switch (ch) {
                case '{':
                case '(':
                case '[':
                    indented++;
                    pushIndenter({ open: ch, indentLevel: indentLevel, line: lineId });
                    break;
                case '=':
                    if (assignInvalidChars.indexOf(noStringsLine[c + 1]) === -1 && assignInvalidChars.indexOf(noStringsLine[c - 1]) === -1) {
                        // skip fat arrows, equals, not equals, etc
                        indented++;
                        pushIndenter({ open: ch, indentLevel: indentLevel, line: lineId });
                    }
                    break;
                case '}':
                case ')':
                case ']':
                    indented = Math.max(0, indented - 1);
                    oldIndent = popIndenter();
                    while (oldIndent && oldIndent.open === '=') {
                        oldIndent = popIndenter();
                        indented = 0;
                    }
                    if (!oldIndent || ch !== indentClosePairs[oldIndent.open]) {
                        return { error: `invalid braces balance at line ${lineId + 1}` };
                    }
                    if (lineId !== oldIndent.line && c > 0) {
                        // skip first char at line - already indented.
                        nextIndentLevel = oldIndent.indentLevel;
                        indented = 0;
                    }
                    break;
                case ';':
                    oldIndent = popIndenter();
                    if (oldIndent) {
                        if (indentClosePairs[oldIndent.open] === ch) {
                            indented--;
                            nextIndentLevel = oldIndent.indentLevel;
                        } else {
                            pushIndenter(oldIndent);
                        }
                    }
                    break;
            }
        }
        if (indented > 0) {
            nextIndentLevel++; // = Math.sign(indented);
        }

        if (nextIndentLevel !== indentLevel) {
            indentLevel = nextIndentLevel < 0 ? 0 : nextIndentLevel;
            indent = getIndent(indentLevel, options.tabSize);
        }
    }
    return { source: output.join('\n') };
};