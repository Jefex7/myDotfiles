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
const extensionState_1 = require("../../extensionState");
const leetCodeChannel_1 = require("../../leetCodeChannel");
const cpUtils_1 = require("../../utils/cpUtils");
const problemUtils_1 = require("../../utils/problemUtils");
const problemTypes_1 = require("../../problems/problemTypes");
const osUtils_1 = require("../../utils/osUtils");
function getGdbDefaultConfig() {
    return {
        type: 'cppdbg',
        MIMode: 'gdb',
        setupCommands: [
            {
                description: 'Enable pretty-printing for gdb',
                text: '-enable-pretty-printing',
                ignoreFailures: true,
            },
        ],
        miDebuggerPath: osUtils_1.isWindows() ? 'gdb.exe' : 'gdb',
    };
}
function getClangDefaultConfig() {
    return {
        type: 'cppdbg',
        MIMode: 'lldb',
        externalConsole: false,
    };
}
const templateMap = {
    116: [117],
    429: [559, 589, 590],
};
function getTemplateId(id) {
    const findKey = Object.keys(templateMap).find((key) => {
        const numId = parseInt(id, 10);
        return templateMap[key].includes(numId);
    });
    return findKey ? findKey : id;
}
class CppExecutor {
    execute(filePath, testString, language, port) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const sourceFileContent = (yield fse.readFile(filePath)).toString();
            const meta = problemUtils_1.fileMeta(sourceFileContent);
            if (meta == null) {
                vscode.window.showErrorMessage("File meta info has been changed, please check the content: '@lc app=leetcode.cn id=xx lang=xx'.");
                return;
            }
            const problemType = problemTypes_1.default[meta.id];
            if (problemType == null) {
                vscode.window.showErrorMessage(`Notsupported problem: ${meta.id}.`);
                return;
            }
            const program = yield problemUtils_1.getEntryFile(meta.lang, meta.id);
            const newSourceFileName = `source${language}problem${meta.id}.cpp`;
            const newSourceFilePath = path.join(extensionState_1.extensionState.cachePath, newSourceFileName);
            const commonHeaderName = `common${language}problem${meta.id}.h`;
            const commonImplementName = `common${language}problem${meta.id}.cpp`;
            // check whether module.exports is exist or not
            const moduleExportsReg = /\/\/ @before-stub-for-debug-begin/;
            if (!moduleExportsReg.test(sourceFileContent)) {
                const newContent = `// @before-stub-for-debug-begin
#include <vector>
#include <string>
#include "${commonHeaderName}"

using namespace std;
// @before-stub-for-debug-end\n\n` + sourceFileContent;
                yield fse.writeFile(filePath, newContent);
                // create source file for build because g++ does not support inlucde file with chinese name
                yield fse.writeFile(newSourceFilePath, newContent);
            }
            else {
                yield fse.writeFile(newSourceFilePath, sourceFileContent);
            }
            const params = testString.split('\\n');
            const paramsType = problemType.paramTypes;
            if (params.length !== paramsType.length) {
                vscode.window.showErrorMessage('Input parameters is not match the problem!');
                return;
            }
            const templateId = getTemplateId(meta.id);
            const indent = '    ';
            let insertCode = `vector<string> params{${params
                .map((p) => `"${p}"`)
                .join(', ')}};\n`;
            const callArgs = [];
            paramsType.map((type, index) => {
                callArgs.push(`arg${index}`);
                insertCode += `
    string param${index} = params[${index}];
    cJSON *item${index} = cJSON_Parse(param${index}.c_str());
`;
                switch (type) {
                    case 'number':
                        insertCode += `${indent}int arg${index} = parseNumber(item${index});\n`;
                        break;
                    case 'number[]':
                        insertCode += `${indent}vector<int> arg${index} = parseNumberArray(item${index});\n`;
                        break;
                    case 'number[][]':
                        insertCode += `${indent}vector<vector<int>> arg${index} = parseNumberArrayArray(item${index});\n`;
                        break;
                    case 'string':
                        insertCode += `${indent}string arg${index} = parseString(item${index});\n`;
                        break;
                    case 'string[]':
                        insertCode += `${indent}vector<string> arg${index} = parseStringArray(item${index});\n`;
                        break;
                    case 'string[][]':
                        insertCode += `${indent}vector<vector<string>> arg${index} = parseStringArrayArray(item${index});\n`;
                        break;
                    case 'ListNode':
                        insertCode += `${indent}ListNode *arg${index} = parseListNode(parseNumberArray(item${index}));\n`;
                        break;
                    case 'ListNode[]':
                        insertCode += `${indent}vector<ListNode *> arg${index} = parseListNodeArray(parseNumberArrayArray(item${index}));\n`;
                        break;
                    case 'character':
                        insertCode += `${indent}char arg${index} = parseCharacter(item${index});\n`;
                        break;
                    case 'character[]':
                        insertCode += `${indent}vector<char> arg${index} = parseCharacterArray(item${index});\n`;
                        break;
                    case 'character[][]':
                        insertCode += `${indent}vector<vector<char>> arg${index} = parseCharacterArrayArray(item${index});\n`;
                        break;
                    case 'NestedInteger[]':
                        insertCode += `${indent}vector<NestedInteger> arg${index} = parseNestedIntegerArray(item${index});\n`;
                        break;
                    case 'MountainArray':
                        insertCode += `${indent}MountainArray arg${index} = MountainArray(parseNumberArray(item${index}));\n`;
                        break;
                    case 'TreeNode':
                        insertCode += `${indent}TreeNode * arg${index} = parseTreeNode(item${index});\n`;
                        break;
                    case 'Node':
                        if (templateId === '133') {
                            insertCode += `${indent}Node * arg${index} = parseNode(parseNumberArrayArray(item${index}));\n`;
                        }
                        else if (templateId === '138') {
                            insertCode += `${indent}Node * arg${index} = parseNode(parsecJSONArray(item${index}));\n`;
                        }
                        else {
                            insertCode += `${indent}Node * arg${index} = parseNode(item${index});\n`;
                        }
                        break;
                }
            });
            if (templateId === '278') {
                insertCode += `${indent}badVersion = arg1;\n`;
                insertCode += `${indent}(new Solution())->${problemType.funName}(arg0);\n`;
            }
            else if (templateId === '341') {
                insertCode += `${indent}NestedIterator i(arg0);\n`;
                insertCode += `${indent}while (i.hasNext()) cout << i.next();;\n`;
            }
            else if (templateId === '843') {
                insertCode += `${indent}secret = arg0;\n`;
                insertCode += `${indent}Master master;\n`;
                insertCode += `${indent}(new Solution())->${problemType.funName}(arg1, master);\n`;
            }
            else if (templateId === '1095') {
                insertCode += `${indent}(new Solution())->${problemType.funName}(arg1, arg0);\n`;
            }
            else {
                insertCode += `${indent}(new Solution())->${problemType.funName}(${callArgs.join(', ')});\n`;
            }
            // insert include code and replace function namem
            const includeFileRegExp = /\/\/ @@stub\-for\-include\-code@@/;
            const codeRegExp = /\/\/ @@stub\-for\-body\-code@@/;
            const entryFile = program;
            const entryFileContent = (yield fse.readFile(entryFile)).toString();
            const newEntryFileContent = entryFileContent
                .replace(includeFileRegExp, `#include "${commonHeaderName}"\n#include "${newSourceFileName}"`)
                .replace(codeRegExp, insertCode);
            yield fse.writeFile(entryFile, newEntryFileContent);
            const extDir = vscode.extensions.getExtension('wangtao0101.debug-leetcode')
                .extensionPath;
            // copy common.h
            const commonHeaderPath = path.join(extDir, 'src/debug/entry/cpp/problems/common.h');
            const commonHeaderContent = (yield fse.readFile(commonHeaderPath)).toString();
            const commonHeaderDestPath = path.join(extensionState_1.extensionState.cachePath, commonHeaderName);
            const specialDefineCode = yield problemUtils_1.getProblemSpecialCode(language, templateId, 'h', extDir);
            yield fse.writeFile(commonHeaderDestPath, commonHeaderContent.replace(/\/\/ @@stub\-for\-problem\-define\-code@@/, specialDefineCode));
            // copy common.cpp
            const commonPath = path.join(extDir, 'src/debug/entry/cpp/problems/common.cpp');
            const commonContent = (yield fse.readFile(commonPath))
                .toString()
                .replace(includeFileRegExp, `#include "${commonHeaderName}"`);
            const commonDestPath = path.join(extensionState_1.extensionState.cachePath, commonImplementName);
            const specialCode = yield problemUtils_1.getProblemSpecialCode(language, templateId, 'cpp', extDir);
            yield fse.writeFile(commonDestPath, commonContent.replace(/\/\/ @@stub\-for\-problem\-define\-code@@/, specialCode));
            const exePath = path.join(extensionState_1.extensionState.cachePath, `${language}problem${meta.id}.exe`);
            const thirdPartyPath = path.join(extDir, 'src/debug/thirdparty/c');
            const jsonPath = path.join(extDir, 'src/debug/thirdparty/c/cJSON.c');
            const compiler = (_a = vscode.workspace.getConfiguration('debug-leetcode').get('cppCompiler')) !== null && _a !== void 0 ? _a : 'gdb';
            let debugConfig;
            if (compiler === 'clang') {
                debugConfig = yield this.getClangDebugConfig({
                    program,
                    exePath,
                    commonDestPath,
                    jsonPath,
                    thirdPartyPath,
                    filePath,
                    newSourceFilePath,
                });
            }
            else {
                debugConfig = yield this.getGdbDebugConfig({
                    program,
                    exePath,
                    commonDestPath,
                    jsonPath,
                    thirdPartyPath,
                    filePath,
                    newSourceFilePath,
                });
            }
            if (debugConfig == null) {
                return;
            }
            const args = [
                filePath,
                testString.replace(/\\"/g, '\\\\"'),
                problemType.funName,
                problemType.paramTypes.join(','),
                problemType.returnType,
                meta.id,
                port.toString(),
            ];
            const debugSessionName = problemUtils_1.randomString(16);
            const debuging = yield vscode.debug.startDebugging(undefined, Object.assign({}, debugConfig, {
                request: 'launch',
                name: debugSessionName,
                args,
            }));
            if (debuging) {
                const debugSessionDisposes = [];
                vscode.debug.breakpoints.map((bp) => {
                    if (bp.location.uri.fsPath === newSourceFilePath) {
                        vscode.debug.removeBreakpoints([bp]);
                    }
                });
                vscode.debug.breakpoints.map((bp) => {
                    if (bp.location.uri.fsPath === filePath) {
                        const location = new vscode.Location(vscode.Uri.file(newSourceFilePath), bp.location.range);
                        vscode.debug.addBreakpoints([
                            new vscode.SourceBreakpoint(location, bp.enabled, bp.condition, bp.hitCondition, bp.logMessage),
                        ]);
                    }
                });
                debugSessionDisposes.push(vscode.debug.onDidChangeBreakpoints((event) => {
                    event.added.map((bp) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location = new vscode.Location(vscode.Uri.file(newSourceFilePath), bp.location.range);
                            vscode.debug.addBreakpoints([
                                new vscode.SourceBreakpoint(location, bp.enabled, bp.condition, bp.hitCondition, bp.logMessage),
                            ]);
                        }
                    });
                    event.removed.map((bp) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location = new vscode.Location(vscode.Uri.file(newSourceFilePath), bp.location.range);
                            vscode.debug.removeBreakpoints([new vscode.SourceBreakpoint(location)]);
                        }
                    });
                    event.changed.map((bp) => {
                        if (bp.location.uri.fsPath === filePath) {
                            const location = new vscode.Location(vscode.Uri.file(newSourceFilePath), bp.location.range);
                            vscode.debug.removeBreakpoints([new vscode.SourceBreakpoint(location)]);
                            vscode.debug.addBreakpoints([
                                new vscode.SourceBreakpoint(location, bp.enabled, bp.condition, bp.hitCondition, bp.logMessage),
                            ]);
                        }
                    });
                }));
                debugSessionDisposes.push(vscode.debug.onDidTerminateDebugSession((event) => {
                    if (event.name === debugSessionName) {
                        debugSessionDisposes.map((d) => d.dispose());
                    }
                }));
            }
            return;
        });
    }
    getGdbDebugConfig({ program, exePath, commonDestPath, jsonPath, thirdPartyPath, filePath, newSourceFilePath, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const debugConfig = getGdbDefaultConfig();
            try {
                const includePath = path.dirname(exePath);
                yield cpUtils_1.executeCommand('g++', [
                    '-g',
                    program,
                    commonDestPath,
                    jsonPath,
                    '-o',
                    exePath,
                    '-I',
                    includePath,
                    '-I',
                    thirdPartyPath,
                ], { shell: false });
            }
            catch (e) {
                vscode.window.showErrorMessage(e);
                leetCodeChannel_1.leetCodeChannel.append(e.stack);
                leetCodeChannel_1.leetCodeChannel.show();
                return;
            }
            debugConfig.program = exePath;
            debugConfig.cwd = extensionState_1.extensionState.cachePath;
            // map build source file to user source file
            debugConfig.sourceFileMap = {
                [newSourceFilePath]: filePath,
            };
            return debugConfig;
        });
    }
    getClangDebugConfig({ program, exePath, commonDestPath, jsonPath, thirdPartyPath, filePath, newSourceFilePath, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const debugConfig = getClangDefaultConfig();
            try {
                const includePath = path.dirname(exePath);
                yield cpUtils_1.executeCommand('/usr/bin/clang++', [
                    '-std=c++17',
                    '-stdlib=libc++',
                    '-g',
                    program,
                    commonDestPath,
                    jsonPath,
                    '-o',
                    exePath,
                    '-I',
                    includePath,
                    '-I',
                    thirdPartyPath,
                ], { shell: false });
            }
            catch (e) {
                vscode.window.showErrorMessage(e);
                leetCodeChannel_1.leetCodeChannel.append(e.stack);
                leetCodeChannel_1.leetCodeChannel.show();
                return;
            }
            debugConfig.program = exePath;
            debugConfig.cwd = extensionState_1.extensionState.cachePath;
            // map build source file to user source file
            debugConfig.sourceFileMap = {
                [newSourceFilePath]: filePath,
            };
            return debugConfig;
        });
    }
}
exports.cppExecutor = new CppExecutor();
//# sourceMappingURL=cppExecutor.js.map