'use strict';

export interface IFormatConfig {
    tabSize: number,
    sortUsingsSystemFirst: boolean;
    emptyLinesInRowLimit: number;
    indentEnabled: boolean;
    indentPreprocessor: boolean;
}

const getIndent = (amount: number, tabSize: number): string => {
    return ' '.repeat(tabSize * amount);
}

export function process(content: string, options: IFormatConfig): string {
    const input = content.split('\n');
    const usingRegex = /^using \w+[\.\w]*;/;
    const StringRegex = /"[^\\"]*(?:\\.[^\\"]*)*"/g;
    const CharRegex = /'[^\\']*(?:\\.[^\\']*)*'/g;
    const SwitchCaseRegex = /(case\s[^:]+|default[\s]*):/;
    const SwitchBreakRegex = /break[\s]*;/;

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
        let noStringsLine = trimmedLine.replace(StringRegex, '""').replace(CharRegex, "''");
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
                if (slCommentStart != 0) {
                    noStringsLine = noStringsLine.substr(0, slCommentStart);
                }
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
            usings.push(usingExpr);
            emptyLinesCount = 0;
            continue;
        }
        if (usings.length > 0) {
            usings.sort((a: string, b: string) => {
                let res = 0;
                if (options.sortUsingsSystemFirst) {
                    if (a.indexOf("System") == 6) { res--; }
                    if (b.indexOf("System") == 6) { res++; }
                    if (res !== 0) {
                        return res;
                    }
                }
                for (var i = 0; i < a.length; i++) {
                    const lhs = a[i].toLowerCase();
                    let rhs = b[i] ? b[i].toLowerCase() : b;
                    if (lhs !== rhs) {
                        res = a[i] < b[i] ? -1 : 1;
                        break;
                    }
                    res += lhs !== a[i] ? 1 : 0;
                    res -= rhs !== b[i] ? 1 : 0;
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
        if (options.indentEnabled) {
            if (noStringsLine[0] === '}' || noStringsLine[0] === ')') {
                output.push(`${getIndent(indentLevel - 1, options.tabSize)}${trimmedLine}`);
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
        } else {
            output.push(rawLine);
        }

        nextIndentLevel = indentLevel;

        if (SwitchCaseRegex.test(noStringsLine)) {
            // hack: check next case line for fall through behaviour.
            if (lineId < (input.length - 1)) {
                const nextNoStringsLine = input[lineId + 1].trim().replace(StringRegex, '""').replace(CharRegex, "''");
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

        for (var c = 0; c < noStringsLine.length; c++) {
            switch (noStringsLine[c]) {
                case '{':
                case '(':
                    nextIndentLevel++;
                    break;
                case '=':
                    if (c == noStringsLine.length - 1) {
                        assignLevel++;
                        nextIndentLevel++;
                    }
                    break;
                case '}':
                case ')':
                    nextIndentLevel--;
                    break;
                case ';':
                    if (assignLevel > 0) {
                        assignLevel--;
                        nextIndentLevel--;
                    }
                    break;
            }
        };
        if (nextIndentLevel !== indentLevel) {
            indentLevel = nextIndentLevel < 0 ? 0 : nextIndentLevel;
            indent = getIndent(indentLevel, options.tabSize);
        }
    }
    return output.join('\n');
}