"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
const debugExecutor_1 = require("../debug/debugExecutor");
const problemTypes_1 = require("../problems/problemTypes");
const problemUtils_1 = require("../utils/problemUtils");
const uiUtils_1 = require("../utils/uiUtils");
const workspaceUtils_1 = require("../utils/workspaceUtils");
function debugSolution(uri, input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = yield workspaceUtils_1.getActiveFilePath(uri);
            if (!filePath) {
                return;
            }
            const fileContent = fs.readFileSync(filePath);
            const meta = problemUtils_1.fileMeta(fileContent.toString());
            if (!problemUtils_1.canDebug(meta)) {
                return;
            }
            let result;
            if (!input) {
                result = yield debugExecutor_1.debugExecutor.execute(filePath, problemTypes_1.default[meta.id].testCase.replace(/"/g, '\\"'), meta.lang);
            }
            else {
                const ts = yield vscode.window.showInputBox({
                    prompt: 'Enter the test cases.',
                    validateInput: (s) => s && s.trim() ? undefined : 'Test case must not be empty.',
                    placeHolder: 'Example: [1,2,3]\\n4',
                    ignoreFocusOut: true,
                });
                if (ts) {
                    result = yield debugExecutor_1.debugExecutor.execute(filePath, ts.replace(/"/g, '\\"'), meta.lang);
                }
            }
            if (!result) {
                return;
            }
        }
        catch (error) {
            yield uiUtils_1.promptForOpenOutputChannel('Failed to debug the solution. Please open the output channel for details.', uiUtils_1.DialogType.error);
        }
    });
}
exports.debugSolution = debugSolution;
//# sourceMappingURL=debug.js.map