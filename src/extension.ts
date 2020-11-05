import * as vscode from "vscode";
import { commands } from "./copy_plus";

export function activate(context: vscode.ExtensionContext) {
    const { registerCommand } = vscode.commands;
    const { subscriptions } = context;

    Object.keys(commands).forEach((key) => {
        const command = commands[key];
        subscriptions.push(
            registerCommand(key, (uri: vscode.Uri) => {
                command(uri);
            })
        );
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
