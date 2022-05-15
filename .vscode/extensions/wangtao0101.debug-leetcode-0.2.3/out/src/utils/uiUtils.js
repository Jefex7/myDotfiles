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
const leetCodeChannel_1 = require("../leetCodeChannel");
var DialogOptions;
(function (DialogOptions) {
    DialogOptions.open = { title: 'Open' };
    DialogOptions.yes = { title: 'Yes' };
    DialogOptions.no = { title: 'No', isCloseAffordance: true };
    DialogOptions.never = { title: 'Never' };
    DialogOptions.singUp = { title: 'Sign up' };
})(DialogOptions = exports.DialogOptions || (exports.DialogOptions = {}));
function promptForOpenOutputChannel(message, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        switch (type) {
            case DialogType.info:
                result = yield vscode.window.showInformationMessage(message, DialogOptions.open, DialogOptions.no);
                break;
            case DialogType.warning:
                result = yield vscode.window.showWarningMessage(message, DialogOptions.open, DialogOptions.no);
                break;
            case DialogType.error:
                result = yield vscode.window.showErrorMessage(message, DialogOptions.open, DialogOptions.no);
                break;
            default:
                break;
        }
        if (result === DialogOptions.open) {
            leetCodeChannel_1.leetCodeChannel.show();
        }
    });
}
exports.promptForOpenOutputChannel = promptForOpenOutputChannel;
function openUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    });
}
exports.openUrl = openUrl;
var DialogType;
(function (DialogType) {
    DialogType["info"] = "info";
    DialogType["warning"] = "warning";
    DialogType["error"] = "error";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
//# sourceMappingURL=uiUtils.js.map