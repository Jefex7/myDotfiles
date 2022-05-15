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
const fse = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const problemTypes_1 = require("../problems/problemTypes");
const extensionState_1 = require("../extensionState");
const shared_1 = require("../shared");
const osUtils_1 = require("./osUtils");
const wslUtils_1 = require("./wslUtils");
const fileMateReg = /@lc\s+(?:[\s\S]*?)\s+id=(\d+)\s+lang=([\S]+)/;
const beforeStubReg = /@before-stub-for-debug-begin([\s\S]*?)@before-stub-for-debug-end/;
const afterStubReg = /@after-stub-for-debug-begin([\s\S]*?)@after-stub-for-debug-end/;
function genFileExt(language) {
    const ext = shared_1.langExt.get(language);
    if (!ext) {
        throw new Error(`The language "${language}" is not supported.`);
    }
    return ext;
}
exports.genFileExt = genFileExt;
function canDebug(meta) {
    if (meta == null ||
        shared_1.supportDebugLanguages.indexOf(meta.lang) === -1 ||
        problemTypes_1.default[meta.id] == null) {
        return false;
    }
    return true;
}
exports.canDebug = canDebug;
function fileMeta(content) {
    const result = fileMateReg.exec(content);
    if (result != null) {
        return {
            id: result[1],
            lang: result[2],
        };
    }
    return null;
}
exports.fileMeta = fileMeta;
function getUnstubedFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = (yield fse.readFile(filePath)).toString();
        const stripped = content.replace(beforeStubReg, '').replace(afterStubReg, '');
        if (content.length === stripped.length) {
            // no stub, return original filePath
            return filePath;
        }
        const meta = fileMeta(content);
        if (meta == null) {
            vscode.window.showErrorMessage("File meta info has been changed, please check the content: '@lc app=leetcode.cn id=xx lang=xx'.");
            throw new Error('');
        }
        const newPath = path.join(extensionState_1.extensionState.cachePath, `${meta.id}-${meta.lang}`);
        yield fse.writeFile(newPath, stripped);
        return newPath;
    });
}
exports.getUnstubedFile = getUnstubedFile;
function getProblemSpecialCode(language, problem, fileExt, extDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const problemPath = path.join(extDir, 'src/debug/entry', language, 'problems', `${problem}.${fileExt}`);
        const isSpecial = yield fse.pathExists(problemPath);
        if (isSpecial) {
            const specialContent = yield fse.readFile(problemPath);
            return specialContent.toString();
        }
        if (language === 'cpp') {
            return '';
        }
        const fileContent = yield fse.readFile(path.join(extDir, 'src/debug/entry', language, 'problems', `common.${fileExt}`));
        return fileContent.toString();
    });
}
exports.getProblemSpecialCode = getProblemSpecialCode;
function getEntryFile(language, problem) {
    return __awaiter(this, void 0, void 0, function* () {
        const extDir = vscode.extensions.getExtension('wangtao0101.debug-leetcode')
            .extensionPath;
        const fileExt = genFileExt(language);
        const specialCode = yield getProblemSpecialCode(language, problem, fileExt, extDir);
        const tmpEntryCode = (yield fse.readFile(path.join(extDir, 'src/debug/entry', language, `entry.${fileExt}`))).toString();
        const entryCode = tmpEntryCode.replace(/\/\/ @@stub-for-code@@/, specialCode);
        const entryPath = path.join(extensionState_1.extensionState.cachePath, `${language}problem${problem}.${fileExt}`);
        yield fse.writeFile(entryPath, entryCode);
        return entryPath;
    });
}
exports.getEntryFile = getEntryFile;
function parseTestString(test) {
    if (wslUtils_1.useWsl() || !osUtils_1.isWindows()) {
        return `'${test}'`;
    }
    // In windows and not using WSL
    if (osUtils_1.usingCmd()) {
        return `"${test.replace(/"/g, '\\"')}"`;
    }
    else {
        // Assume using PowerShell
        return `'${test.replace(/"/g, '\\"')}'`;
    }
}
exports.parseTestString = parseTestString;
function randomString(len) {
    len = len || 32;
    const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
exports.randomString = randomString;
//# sourceMappingURL=problemUtils.js.map