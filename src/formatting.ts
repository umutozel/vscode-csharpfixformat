'use strict';

export interface FormatConfig {
    tabSize: number,
    sortUsingsSystemFirst: boolean;
    emptyLinesInRowLimit: number;
    indentEnabled: boolean;
}

const getIndent = (amount: number, tabSize: number): string => {
    return ' '.repeat(tabSize * amount);
}

export function process(content: string, options: FormatConfig): string {
    const input = content.split('\n');
    const usingRegex = /^using \w+[\.\w]*;/;
    const usings = [];
    const output = [];
    let indentLevel = 0;
    let indent = getIndent(indentLevel, options.tabSize);
    let nextIndentLevel: number;
    let isIndentDirty: boolean;
    let emptyLinesCount = 0;

    for (let lineId = 0; lineId < input.length; lineId++) {
        const rawLine = input[lineId];
        const line = rawLine.trim();
        // detect usings
        if (usingRegex.test(line)) {
            let usingExpr = line.match(usingRegex)[0];
            if (line.length > usingExpr.length) {
                input.splice(lineId + 1, 0, line.substr(usingExpr.length));
            }
            usingExpr = usingExpr.substr(0, usingExpr.length - 1);
            usings.push(usingExpr);
            emptyLinesCount = 0;
            continue;
        }
        if (usings.length > 0) {
            usings.sort((a, b) => {
                if (options.sortUsingsSystemFirst) {
                    let res = 0;
                    if (a.indexOf("System") == 6) { res--; }
                    if (b.indexOf("System") == 6) { res++; }
                    if (res !== 0) {
                        return res;
                    }
                }
                return a < b ? -1 : (a > b ? 1 : 0);
            });
            for (let i = 0; i < usings.length; i++) {
                output.push(`${indent}${usings[i]};`);
            }
            usings.length = 0;
        }
        // emptyLinesInRowLimit
        if (line.length === 0) {
            if (options.emptyLinesInRowLimit >= 0) {
                if (emptyLinesCount >= options.emptyLinesInRowLimit) {
                    continue;
                }
                emptyLinesCount++;
            }
        } else {
            emptyLinesCount = 0;
        }

        if (options.indentEnabled) {
            isIndentDirty = line.length > 0 && (line[0] === '}' || line[0] === ')');
            if (!isIndentDirty) {
                output.push(`${indent}${line}`);
            }
        } else {
            output.push(rawLine);
        }

        nextIndentLevel = indentLevel;
        for (var c = 0; c < line.length; c++) {
            switch (line[c]) {
                case '{':
                case '(':
                    nextIndentLevel++;
                    break;
                case '}':
                case ')':
                    nextIndentLevel--;
                    break;
            }
        };
        if (nextIndentLevel !== indentLevel) {
            indentLevel = nextIndentLevel < 0 ? 0 : nextIndentLevel;
            indent = getIndent(indentLevel, options.tabSize);
        }

        if (options.indentEnabled && isIndentDirty) {
            output.push(`${indent}${line}`);
        }
    }
    return output.join('\n');
}