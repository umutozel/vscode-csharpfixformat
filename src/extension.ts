'use strict';

import * as vscode from 'vscode';
import * as formatting from './formatting';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('csharpfixformat.process', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor !== null) {
            const doc = editor.document;
            if (doc.languageId === 'csharp') {
                return editor.edit(edit => {
                    const cfg = vscode.workspace.getConfiguration();
                    const options: formatting.FormatConfig = {
                        sortUsingsSystemFirst: cfg.get<boolean>('csharpfixformat.sortUsingsSystemFirst')
                    };
                    const selection = new vscode.Range(0, 0, doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
                    edit.replace(selection, formatting.process(doc.getText(), options));
                });
            }
        }
        vscode.window.showErrorMessage('CSharp file should be opened before command execution.');
    }));
}

export function deactivate() {
}