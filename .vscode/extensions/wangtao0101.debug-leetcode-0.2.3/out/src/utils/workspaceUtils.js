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
const wsl = require("./wslUtils");
function getActiveFilePath(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        let textEditor;
        if (uri) {
            textEditor = yield vscode.window.showTextDocument(uri, { preview: false });
        }
        else {
            textEditor = vscode.window.activeTextEditor;
        }
        if (!textEditor) {
            return undefined;
        }
        if (textEditor.document.isDirty && !(yield textEditor.document.save())) {
            vscode.window.showWarningMessage('Please save the solution file first.');
            return undefined;
        }
        return wsl.useWsl()
            ? wsl.toWslPath(textEditor.document.uri.fsPath)
            : textEditor.document.uri.fsPath;
    });
}
exports.getActiveFilePath = getActiveFilePath;
function checkCachePath(globalStoragePath) {
    if (!fs.existsSync(globalStoragePath)) {
        fs.mkdirSync(globalStoragePath);
    }
}
exports.checkCachePath = checkCachePath;
//# sourceMappingURL=workspaceUtils.js.map