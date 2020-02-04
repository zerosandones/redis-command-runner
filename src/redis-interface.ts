import * as vscode from 'vscode';
import { RedisClient, createClient, print, RedisError, ClientOpts, RetryStrategyOptions } from 'redis';

import { MessageHandler } from './message-handler';

export class RedisInterface {

    private client!: RedisClient;
    private messageHandler: MessageHandler;
    private connectionClientOptions: ClientOpts = {};

    constructor (messageHandler: MessageHandler) {
        console.log("RedisCommander constructor");
        this.messageHandler = messageHandler;
    }

    public connect = () => {
        console.log('connect');
        this.input("Redis URL", "eg. redis://localhost:6379")
        .then(url => {
            if (url) {
                this.connectionClientOptions.url = url;
                this.connectionClientOptions.retry_strategy = this.retryStrategy;
                this.client = createClient(this.connectionClientOptions);
                this.client.on("connect", () => {
                    this.messageHandler.displayStatusBarMessage(`$(database) Redis > ${url}`);
                });
                this.client.on("end", () => {
                    this.messageHandler.displayStatusBarMessage(`$(database) Redis > disconnected`);
                });

                this.client.on("error", (error: RedisError) => {
                    console.error("recevied error messge ", error);
                    this.messageHandler.displayErrorMessage(error.message);
                });
                
            }
        });
        
    }

    public command = () => {
        console.log('command');
        this.input('Redis Command', 'LRANGE list 0 -1')
        .then(commandString => {
            if (commandString) {
                const command = commandString.substring(0, commandString.indexOf(' '));
                const commandArguments = commandString.substring(commandString.indexOf(' ') + 1).match(/[^"' ]+|(['"][^'"]*["'])/g);
                console.log(`command ${command}, arguments ${commandArguments}`);
                this.client.sendCommand(command, commandArguments as [], (err, message) => {
                    this.messageHandler.displayReply(commandString, err, message);
                });
            }
        });
    }

    public disconnect = () => {
        if (this.client) {
            console.log('disconnect');
            this.client.end(true);
            this.messageHandler.displayStatusBarMessage(`$(database) Redis > disconnected`);
        }
    }

    private inputWithDefault = (prompt: string, placeholder: string, defaultValue: string): Promise<string> => {
        return new Promise((resolve, reject) => 
            vscode.window.showInputBox({value: defaultValue, prompt: prompt, placeHolder: placeholder})
            .then((input) => input ? resolve(input) : resolve(defaultValue)));
    }

    private input = (prompt: string, placeholder: string): Promise<string> => {
        return new Promise((resolve, reject) => 
            vscode.window.showInputBox({prompt: prompt, placeHolder: placeholder})
            .then((input) => input ? resolve(input) : resolve()));
    }

    /*
     * only try to connect one time, display error with message from server
     */
    private retryStrategy = (options: RetryStrategyOptions) => {
        this.messageHandler.displayErrorMessage(options.error.message);
        return new Error(options.error.message);
    }

/*exports.strictInput = (prompt, placeholder) => 
    new Promise((resolve, reject) => 
        vscode.window.showInputBox({value: '', prompt: prompt, placeHolder: placeholder})
            .then((input) => input ? resolve(input) : reject()));

exports.strictPick = (values, placeHolder) => 
    new Promise((resolve, reject) =>
        vscode.window.showQuickPick(values, { matchOnDescription: false, placeHolder: placeHolder })
            .then(choice => choice ? resolve(choice) : reject()));*/
}