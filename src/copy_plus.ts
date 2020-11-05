"use strict";

import * as vscode from "vscode";
import * as path from "path";
import { EOL } from "os";
import { copy } from "copy-paste";

const COPY_WITH_LINE_NUMBERS = "copy_plus.with_line_number";
const COPY_WITH_LINE_NUMBERS_WITHOUT_PATH = COPY_WITH_LINE_NUMBERS + ".withoutPath";
const COPY_WITH_LINE_NUMBERS_WITH_FULL_PATH = COPY_WITH_LINE_NUMBERS + ".withFullPath";
const COPY_WITH_LINE_NUMBERS_WITH_RELATIVE_PATH = COPY_WITH_LINE_NUMBERS + ".withRelativePath";
const COPY_WITH_LINE_NUMBERS_WITH_FILE_NAME = COPY_WITH_LINE_NUMBERS + ".withFileName";
const COPY_FILE_NAME = "copy_plus.file_name";

const OPTION_WITH_FULL_PATH = "withFullPath";
const OPTION_WITH_RELATIVE_PATH = "withRelativePath";
const OPTION_WITH_FILE_NAME = "withFileName";

const MULTI_SELECTION_SEPARATOR = "---";

function leftPad(val: any, count: number, pad: any = " "): string {
    let strRet: string = "";
    let strVal: string = "" + val;
    console.log(strVal.length, count);
    if (count > strVal.length) {
        let nPadLen: number = count - strVal.length;
        let strPad: string = new Array(nPadLen + 1).join(pad);
        strRet = strPad + strVal;
    } else {
        strRet = strVal.substring(0, count);
    }
    return strRet;
}

function copyWithLineNumbers(option?: any) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
    }

    const document = editor.document;
    const fullPath = document.fileName;
    const relativePath = vscode.workspace.workspaceFolders
        ? path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath)
        : fullPath;
    const fileName = path.basename(fullPath);

    let file = "";
    switch (option) {
        case OPTION_WITH_FULL_PATH:
            file = fullPath;
            break;
        case OPTION_WITH_RELATIVE_PATH:
            file = relativePath;
            break;
        case OPTION_WITH_FILE_NAME:
            file = fileName;
            break;
        default:
            break;
    }

    let str = file ? `File: ${file}${EOL}` : "";

    const selections = [...editor.selections].sort((a, b) => a.start.line - b.start.line);
    const lastSelection = selections[selections.length - 1];
    const largestLineNumber = lastSelection.end.line + 1;
    const largestLineNumberLength = largestLineNumber.toString().length;

    selections.forEach((selection, i) => {
        if (i > 0) str += `${MULTI_SELECTION_SEPARATOR}${EOL}`;

        for (let n = selection.start.line; n <= selection.end.line; n += 1) {
            const number = leftPad(n + 1, largestLineNumberLength, 0);
            const line = document.lineAt(n).text;

            str += `${number}: ${line}${EOL}`;
        }
    });

    copy(str, () => {
        const showSuccessMessage = vscode.workspace
            .getConfiguration("copy_plus")
            .get("showSuccessMessage");
        if (showSuccessMessage) vscode.window.showInformationMessage("Copied!");
    });
}

function copyFileName(uri: vscode.Uri) {
    const fileName = path.basename(uri.fsPath);
    // console.log(fileName);

    copy(fileName, () => {
        const showSuccessMessage = vscode.workspace
            .getConfiguration("copy_plus")
            .get("showSuccessMessage");
        if (showSuccessMessage) vscode.window.showInformationMessage("Copied!");
    });
}

export const commands = {
    [COPY_WITH_LINE_NUMBERS_WITHOUT_PATH]: (uri: vscode.Uri) => {
        copyWithLineNumbers();
    },
    [COPY_WITH_LINE_NUMBERS_WITH_FULL_PATH]: (uri: vscode.Uri) => {
        copyWithLineNumbers(OPTION_WITH_FULL_PATH);
    },
    [COPY_WITH_LINE_NUMBERS_WITH_RELATIVE_PATH]: (uri: vscode.Uri) => {
        copyWithLineNumbers(OPTION_WITH_RELATIVE_PATH);
    },
    [COPY_WITH_LINE_NUMBERS_WITH_FILE_NAME]: (uri: vscode.Uri) => {
        copyWithLineNumbers(OPTION_WITH_FILE_NAME);
    },
    [COPY_FILE_NAME]: (uri: vscode.Uri) => {
        copyFileName(uri);
    },
};
