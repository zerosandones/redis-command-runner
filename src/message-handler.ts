import * as vscode from 'vscode';

export class MessageHandler {

    /*exports.info = (message) => vscode.window.showInformationMessage(message);
exports.warn = (message) => vscode.window.showWarningMessage(message);
exports.error = (error) => vscode.window.showErrorMessage(error);=-*/

    private statusBarMessage: vscode.StatusBarItem;
    private output: vscode.OutputChannel;

    constructor() {
        this.statusBarMessage = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.output = vscode.window.createOutputChannel("Redis");
    }

    public displayStatusBarMessage = (message: string, tooltip?: string) => {
        this.statusBarMessage.text = message;
        if (tooltip) {
            this.statusBarMessage.tooltip = tooltip;
        }
        this.statusBarMessage.show();
    }

    public displayReply = (command: String, error: Error | null, message: any) => {

        this.output.appendLine('');
        this.output.appendLine(`${command}`);
        if (error) {
            this.output.appendLine(`${error}`);
        } else {
            this.output.appendLine(`${message}`);
        }
        
        this.output.show();
    }

    public displayInfoMessage = (message: string) => {
        vscode.window.showInformationMessage(message);
    }

    public displayWarningMessage = (message: string) => {
        vscode.window.showWarningMessage(message);
    }

    public displayErrorMessage = (message: string) => {
        vscode.window.showErrorMessage(message);
    }


}