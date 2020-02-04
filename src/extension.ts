// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RedisInterface } from './redis-interface';
import { MessageHandler } from './message-handler';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const messageHandler = new MessageHandler();
	const redisCommander = new RedisInterface(messageHandler);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "redis-commander" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	/*let disposable = vscode.commands.registerCommand('extension.redis.command', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});*/

	addCommand(context, 'extension.redis-commander.connect', redisCommander.connect);

	addCommand(context, 'extension.redis-commander.command', redisCommander.command);

	addCommand(context, 'extension.redis-commander.disconnect', redisCommander.disconnect);

	
}

function addCommand (context: vscode.ExtensionContext, command: string, handler: () => void): void {
	context.subscriptions.push(
		vscode.commands.registerCommand(command, handler)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
