"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class LeetCodeChannel {
    constructor() {
        this.channel = vscode.window.createOutputChannel('Debug LeetCode');
    }
    appendLine(message) {
        this.channel.appendLine(message);
    }
    append(message) {
        this.channel.append(message);
    }
    show() {
        this.channel.show();
    }
    dispose() {
        this.channel.dispose();
    }
}
exports.leetCodeChannel = new LeetCodeChannel();
//# sourceMappingURL=leetCodeChannel.js.map