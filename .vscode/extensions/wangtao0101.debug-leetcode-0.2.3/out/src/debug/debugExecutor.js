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
const net = require("net");
// import * as path from "path";
const vscode = require("vscode");
const leetCodeChannel_1 = require("../leetCodeChannel");
const problemUtils_1 = require("../utils/problemUtils");
const cppExecutor_1 = require("./executor/cppExecutor");
const problemTypes_1 = require("../problems/problemTypes");
const debugConfigMap = new Map([
    [
        'javascript',
        {
            type: 'node',
        },
    ],
    [
        'python3',
        {
            type: 'python',
            env: {
                PYTHONPATH: '',
            },
        },
    ],
]);
class DebugExecutor {
    constructor() {
        this.start();
    }
    execute(filePath, testString, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server == null || this.server.address() == null) {
                vscode.window.showErrorMessage('Debug server error, maybe you can restart vscode.');
            }
            if (language === 'cpp') {
                yield cppExecutor_1.cppExecutor.execute(filePath, testString, language, this.server.address().port);
                return;
            }
            const debugConfig = debugConfigMap.get(language);
            if (debugConfig == null) {
                vscode.window.showErrorMessage('Notsupported language.');
                return;
            }
            const fileContent = yield fse.readFile(filePath);
            const meta = problemUtils_1.fileMeta(fileContent.toString());
            if (meta == null) {
                vscode.window.showErrorMessage("File meta info has been changed, please check the content: '@lc app=leetcode.cn id=xx lang=xx'.");
                return;
            }
            const problemType = problemTypes_1.default[meta.id];
            if (problemType == null) {
                vscode.window.showErrorMessage(`Notsupported problem: ${meta.id}.`);
                return;
            }
            debugConfig.program = yield problemUtils_1.getEntryFile(meta.lang, meta.id);
            const funName = this.getProblemFunName(language, problemType);
            if (language === 'javascript') {
                // check whether module.exports is exist or not
                const moduleExportsReg = new RegExp(`module.exports = ${problemType.funName};`);
                if (!moduleExportsReg.test(fileContent.toString())) {
                    fse.writeFile(filePath, fileContent.toString() +
                        `\n// @after-stub-for-debug-begin\nmodule.exports = ${funName};\n// @after-stub-for-debug-end`);
                }
            }
            else if (language === 'python3') {
                // check whether module.exports is exist or not
                const moduleExportsReg = /# @before-stub-for-debug-begin/;
                if (!moduleExportsReg.test(fileContent.toString())) {
                    yield fse.writeFile(filePath, `# @before-stub-for-debug-begin\nfrom python3problem${meta.id} import *\nfrom typing import *\n# @before-stub-for-debug-end\n\n` +
                        fileContent.toString());
                }
                debugConfig.env.PYTHONPATH = debugConfig.program;
            }
            const args = [
                filePath,
                testString,
                problemType.funName,
                problemType.paramTypes.join(','),
                problemType.returnType,
                meta.id,
                this.server.address().port.toString(),
            ];
            vscode.debug.startDebugging(undefined, Object.assign({}, debugConfig, {
                request: 'launch',
                name: 'Launch Program',
                args,
            }));
            return;
        });
    }
    /**
     * for some problem have special function name
     * @param language
     * @param problemType
     */
    getProblemFunName(language, problemType) {
        if (problemType.specialFunName && problemType.specialFunName[language]) {
            return problemType.specialFunName[language];
        }
        return problemType.funName;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server = net.createServer((clientSock) => {
                clientSock.setEncoding('utf8');
                clientSock.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
                    const result = JSON.parse(data.toString());
                    if (result.type === 'error') {
                        vscode.window.showErrorMessage(result.message);
                    }
                    else {
                        // const leetcodeResult: string = await leetCodeExecutor.testSolution(
                        //     result.filePath,
                        //     parseTestString(result.testString.replace(/\\"/g, '"')),
                        // );
                        // if (!leetcodeResult) {
                        //     return;
                        // }
                        // leetCodeSubmissionProvider.show(leetcodeResult);
                    }
                }));
                clientSock.on('error', (error) => {
                    leetCodeChannel_1.leetCodeChannel.appendLine(error.toString());
                });
            });
            this.server.on('error', (error) => {
                leetCodeChannel_1.leetCodeChannel.appendLine(error.toString());
            });
            // listen on a random port
            this.server.listen({ port: 0, host: '127.0.0.1' });
        });
    }
}
exports.debugExecutor = new DebugExecutor();
//# sourceMappingURL=debugExecutor.js.map