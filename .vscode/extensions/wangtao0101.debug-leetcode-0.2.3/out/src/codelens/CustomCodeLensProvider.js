"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const problemUtils_1 = require("../utils/problemUtils");
class CustomCodeLensProvider {
    constructor() {
        this.onDidChangeCodeLensesEmitter = new vscode.EventEmitter();
    }
    get onDidChangeCodeLenses() {
        return this.onDidChangeCodeLensesEmitter.event;
    }
    provideCodeLenses(document) {
        const content = document.getText();
        console.log(problemUtils_1.fileMeta(content));
        if (!problemUtils_1.canDebug(problemUtils_1.fileMeta(content))) {
            return undefined;
        }
        let codeLensLine = document.lineCount - 1;
        for (let i = document.lineCount - 1; i >= 0; i--) {
            const lineContent = document.lineAt(i).text;
            if (lineContent.indexOf('@lc code=end') >= 0) {
                codeLensLine = i;
                break;
            }
        }
        const range = new vscode.Range(codeLensLine, 0, codeLensLine, 0);
        const codeLens = [];
        codeLens.push(new vscode.CodeLens(range, {
            title: 'Debug',
            command: 'debug-leetcode.debugSolution',
            arguments: [document.uri, false],
        }));
        codeLens.push(new vscode.CodeLens(range, {
            title: 'Debug Input',
            command: 'debug-leetcode.debugSolution',
            arguments: [document.uri, true],
        }));
        return codeLens;
    }
}
exports.CustomCodeLensProvider = CustomCodeLensProvider;
//# sourceMappingURL=CustomCodeLensProvider.js.map