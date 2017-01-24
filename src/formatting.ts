'use strict';

export interface FormatConfig {
    sortUsingsSystemFirst: boolean;
}

export function format(content: string, options: FormatConfig): string {
    const input = content.split('\n');
    const usingRegex = /using \w+[\.\w]*;/;
    const usings = [];
    let output = '';
    let firstLine = -1;
    let indent = '';
    let lineCount = 0;

    for (let lineId = 0; lineId < input.length; lineId++) {
        let line = input[lineId];
        if (usingRegex.test(line)) {
            const idx = line.indexOf('using ');
            if (idx === line.lastIndexOf('using ')) {
                // new using
                if (lineCount === 0) {
                    indent = " ".repeat(idx);
                    firstLine = lineId;
                }
                lineCount++;
            }
        } else {
            if (lineCount > 0) {
                usings.length = 0;
                for (let i = 0; i < lineCount; i++) {
                    const shortLine = input[firstLine + i].trim();
                    usings.push(shortLine.substr(0, shortLine.length - 1));
                }
                usings.sort((a, b) => {
                    if (options.sortUsingsSystemFirst) {
                        let res = 0;
                        res -= a.indexOf("System") == 6 ? 1 : 0;
                        res += b.indexOf("System") == 6 ? 1 : 0;
                        if (res !== 0) {
                            return res;
                        }
                    }
                    return a < b ? -1 : (a > b ? 1 : 0);
                });
                for (let i = 0; i < lineCount; i++) {
                    output += `${lineId > 0 ? '\n' : ''}${indent}${usings[i]};`;
                }
                lineCount = 0;
                firstLine = -1;
            }
            output += `${lineId > 0 ? '\n' : ''}${line}`;
        }
    }
    return output;
}