"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Text_1 = require("./Text");
const fs = require("fs");
class Love2DCompletionProvider {
    constructor() {
        this.love2DCategoryMap = new Map();
        this.categoryDescriptions = new Map();
        console.log(__dirname + '/' + "love2d.json");
        let text = fs.readFileSync(__dirname + '/../../' + "love2d.json", 'utf8');
        let rootArray = JSON.parse(text);
        for (let i = 0; i < rootArray.length; i++) {
            let catName = rootArray[i]["category"];
            let funcArray = rootArray[i]["functions"];
            this.love2DCategoryMap.set(catName, funcArray);
            this.categoryDescriptions.set(catName, rootArray[i]["description"]);
        }
    }
    // public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
    //     vscode.CompletionItem[] {
    //         let completionItems: vscode.CompletionItem[] = [];
    //         return completionItems;
    //         //or return null;
    // }
    getMethodSignature(methodInfo) {
        if (!methodInfo.hasOwnProperty("methodName"))
            return "";
        if (methodInfo.hasOwnProperty("parameters")) {
            let arr = methodInfo["parameters"];
            let sig = "";
            for (let i = 0; i < arr.length; i++) {
                sig += arr[i]["name"];
                if (i < arr.length - 1)
                    sig += ",";
            }
            // sig += ")";
            return sig;
        }
        else {
            return "";
        }
    }
    getMethodSignatureInfo(methodInfo) {
        // if (!methodInfo.hasOwnProperty("methodName")) return "";
        if (methodInfo.hasOwnProperty("parameters")) {
            let arr = methodInfo["parameters"];
            let sig = "";
            for (let i = 0; i < arr.length; i++) {
                sig += arr[i]["name"] + " : ";
                sig += arr[i]["description"];
                if (i < arr.length - 1)
                    sig += "\n";
            }
            return sig;
        }
        else {
            return "";
        }
    }
    getCategoriesCompletionInfo(completionItems) {
        for (var category of this.love2DCategoryMap.keys()) {
            let item = new vscode.CompletionItem(category, vscode.CompletionItemKind.Module);
            item.documentation = this.categoryDescriptions.get(category);
            completionItems.push(item);
        }
        return completionItems;
    }
    getMethodCompletionInfos(category, completionItems) {
        let categoryArray = this.love2DCategoryMap.get(category);
        if (categoryArray != null) {
            for (var obj of categoryArray) {
                if (obj["methodName"]) {
                    let item = new vscode.CompletionItem(obj["methodName"], vscode.CompletionItemKind.Function);
                    item.documentation = this.getMethodSignatureInfo(obj) + "\n";
                    item.documentation += obj["description"];
                    completionItems.push(item);
                }
            }
        }
    }
    getMethodParameterInfo(category, methodName, completionItems) {
        let categoryArray = this.love2DCategoryMap.get(category);
        if (categoryArray != null && categoryArray.length > 0) {
            for (var obj of categoryArray) {
                if (obj["methodName"] == methodName) {
                    let methodSignature = this.getMethodSignature(obj);
                    if (methodSignature === "")
                        return;
                    let item = new vscode.CompletionItem(methodSignature, vscode.CompletionItemKind.Text);
                    item.documentation = this.getMethodSignatureInfo(obj) + "\n";
                    item.documentation += obj["description"];
                    completionItems.push(item);
                    return;
                }
            }
        }
    }
    provideCompletionItems(document, position, token) {
        return new Promise((resolve, reject) => {
            let lastCharTyped = "";
            if (position.character > 0) {
                lastCharTyped = document.lineAt(position.line).text.charAt(position.character - 1);
                if (lastCharTyped == "(")
                    position = position.translate(0, -1);
            }
            let words = Text_1.default.get_dotted_words(document, position);
            if (words.length == 0 || words[0] != "love") {
                reject();
                return null;
            }
            else {
                let completionItems = [];
                let categoryArray;
                let methodName = "";
                if (words.length == 1 && words[0] === "love") {
                    this.getCategoriesCompletionInfo(completionItems);
                }
                else if (words.length == 2) {
                    this.getMethodCompletionInfos(words[1], completionItems);
                    if (completionItems.length <= 0)
                        this.getCategoriesCompletionInfo(completionItems);
                }
                else if (words.length == 3 && lastCharTyped != ".") {
                    if (lastCharTyped != "(")
                        this.getMethodCompletionInfos(words[1], completionItems);
                    else { //Ah the user is typing function parameters
                        this.getMethodParameterInfo(words[1], words[2], completionItems);
                    }
                }
                if (completionItems != null && completionItems.length > 0)
                    resolve(completionItems);
                else {
                    reject();
                    return null;
                }
            }
            // else if(words.length == 3){
            //     categoryArray = this.love2DCategoryMap.get(words[1]);
            //     if (categoryArray != null) {
            //         for (var obj of categoryArray) {
            //             if (obj["methodName"]) {
            //                 let item = new vscode.CompletionItem(obj["methodName"], vscode.CompletionItemKind.Function);
            //                 item.documentation = this.getMethodSignatureInfo(obj) + "\n";
            //                 item.documentation += obj["description"];
            //                 completionItems.push(item);
            //             }
            //         }
            //     }
            //     else{
            //         reject();
            //         return null;
            //     }
            // }
            // else{
            //     reject();
            //     return null;
            // }
        });
    }
}
exports.default = Love2DCompletionProvider;
//# sourceMappingURL=Love2DCompletionProvider.js.map