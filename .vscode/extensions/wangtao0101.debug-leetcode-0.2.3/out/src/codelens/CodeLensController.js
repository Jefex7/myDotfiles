"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const CustomCodeLensProvider_1 = require("./CustomCodeLensProvider");
class CodeLensController {
    constructor() {
        this.internalProvider = new CustomCodeLensProvider_1.CustomCodeLensProvider();
        this.registeredProvider = vscode_1.languages.registerCodeLensProvider({ scheme: 'file' }, this.internalProvider);
    }
    dispose() {
        if (this.registeredProvider) {
            this.registeredProvider.dispose();
        }
    }
}
exports.codeLensController = new CodeLensController();
//# sourceMappingURL=CodeLensController.js.map