import * as vscode from 'vscode';
import * as formatting from './formatting';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('csharpfixformat.process', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const doc = editor.document;
            if (doc.languageId === 'csharp') {
                return editor.edit(edit => {
                    const cfg = vscode.workspace.getConfiguration('csharpfixformat');
                    const options: formatting.IFormatConfig = {
                        tabSize: vscode.workspace.getConfiguration().get<number>('editor.tabSize', 4),
                        sortUsingsEnabled: cfg.get<boolean>('sort.usings.enabled', true),
                        sortUsingsSystemFirst: cfg.get<boolean>('sort.usings.systemFirst', true),
                        sortUsingsSplitGroups: cfg.get<boolean>('sort.usings.splitGroups', false),
                        styleEnabled: cfg.get<boolean>('style.enabled', true),
                        styleNewLineMaxAmount: cfg.get<number>('style.newline.maxAmount', 0),
                        styleIndentPreprocessorIgnored: cfg.get<boolean>('style.indent.preprocessorIgnored', true)
                    };
                    const result = formatting.process(doc.getText(), options);
                    if (result.error) {
                        return vscode.window.showWarningMessage(result.error);
                    }
                    if (result.source) {
                        edit.replace(new vscode.Range(0, 0, doc.lineCount, 0), result.source);
                    }
                }).then(() => {
                    // reformat code with registered code formatter.
                    vscode.commands.executeCommand('editor.action.formatDocument');
                });
            }
        }
        vscode.window.showErrorMessage('CSharp file should be opened before command execution.');
    }));
}

export function deactivate() {
}