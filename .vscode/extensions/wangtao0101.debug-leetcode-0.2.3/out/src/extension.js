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
const vscode = require("vscode");
const CodeLensController_1 = require("./codelens/CodeLensController");
const extensionState_1 = require("./extensionState");
const leetCodeChannel_1 = require("./leetCodeChannel");
const uiUtils_1 = require("./utils/uiUtils");
const workspaceUtils_1 = require("./utils/workspaceUtils");
const debug_1 = require("./commands/debug");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            extensionState_1.extensionState.context = context;
            extensionState_1.extensionState.cachePath = context.globalStoragePath;
            workspaceUtils_1.checkCachePath(extensionState_1.extensionState.cachePath);
            context.subscriptions.push(leetCodeChannel_1.leetCodeChannel, CodeLensController_1.codeLensController, vscode.commands.registerCommand('debug-leetcode.debugSolution', (uri, input) => debug_1.debugSolution(uri, input)));
        }
        catch (error) {
            leetCodeChannel_1.leetCodeChannel.appendLine(error.toString());
            uiUtils_1.promptForOpenOutputChannel('Extension initialization failed. Please open output channel for details.', uiUtils_1.DialogType.error);
        }
    });
}
exports.activate = activate;
function deactivate() {
    // Do nothing.
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map