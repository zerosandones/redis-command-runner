import { window, QuickPickItem } from 'vscode';
import { RedisClient, createClient, RedisError, ClientOpts, RetryStrategyOptions } from 'redis';

import { MessageHandler } from './message-handler';
import { ExtensionSettings } from './extension-settings';

export class RedisInterface {

    private client!: RedisClient;
    private messageHandler: MessageHandler;
    private connectionClientOptions: ClientOpts = {};

    private extensionSettings: ExtensionSettings;

    constructor (messageHandler: MessageHandler) {
        console.log("RedisCommander constructor");
        this.messageHandler = messageHandler;
        this.extensionSettings = new ExtensionSettings();
    }

    public connect = () => {
        console.log('connect');
        let serverAddress: string;
        let password: string;

        const urls = this.extensionSettings.quickPickUrls;
        let serverUrlPromise: Promise<string>;
        if (urls.length === 0) {
            serverUrlPromise = this.promptForServerURL();
        } else {
            serverUrlPromise = this.selectServerURL(urls);
        }

        serverUrlPromise.then((url: string) => {
            if (url) {
                serverAddress = url;
                this.secretInput("Password", "Press enter for none")
                .then((passwordInput: string) => {
                    if (passwordInput) {
                        console.log('password present');
                        password = passwordInput;
                    }
                    this.makeConnection(serverAddress, password);
                });
            }
        });
        
    }

    public command = () => {
        console.log('command');
        window.showInputBox({prompt: 'Redis Command', placeHolder: 'LRANGE list 0 -1'}).then(commandString => {
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

    private makeConnection = (serverAddress: string, password: string) => {
        console.log(`connecting to ${serverAddress}`);
        this.connectionClientOptions.url = serverAddress;
        if (password) {
            console.log(`password present`);
            this.connectionClientOptions.password = password;
        }
        this.connectionClientOptions.retry_strategy = this.retryStrategy;
        this.client = createClient(this.connectionClientOptions);

        this.client.on("connect", () => {
            this.messageHandler.displayStatusBarMessage(`$(database) Redis > ${serverAddress}`);
            this.extensionSettings.addConnectionUrl(serverAddress);

        });
        this.client.on("end", () => {
            this.messageHandler.displayStatusBarMessage(`$(database) Redis > disconnected`);
        });

        this.client.on("error", (error: RedisError) => {
            console.error("recevied error messge ", error);
            this.messageHandler.displayErrorMessage(error.message);
        });
    }

    private secretInput = (prompt: string, placeHolder: string): Promise<string> => {
        return new Promise((resolve, reject) => 
            window.showInputBox({prompt: prompt, placeHolder: placeHolder, password: true})
                .then((input) => input ? resolve(input) : resolve()));
    }

    /*
     * only try to connect one time, display error with message from server
     */
    private retryStrategy = (options: RetryStrategyOptions) => {
        this.messageHandler.displayErrorMessage(options.error.message);
        return new Error(options.error.message);
    }


    private promptForServerURL(): Promise<string> {
        const options = {prompt: "Redis server address", placeHolder: "redis://localhost:6379"};
        return new Promise((resolve, reject) => window.showInputBox(options)
            .then((input) => input ? resolve(input) : resolve()));
    }

    private async selectServerURL(serverAddresses: QuickPickItem[]): Promise<string> {

        const output = new Promise<string>((resolve, reject) => {
            const quickPick =  window.createQuickPick<QuickPickItem>();
            quickPick.items = serverAddresses;
            quickPick.title = 'Redis server address';
            quickPick.placeholder = 'redis://localhost:6379';

            quickPick.onDidAccept(() => {
                console.log(`quickPick onDidAccept ${quickPick.value}, selectedItems = ${quickPick.selectedItems.length}`);
                resolve(quickPick.value);
            });

            quickPick.onDidChangeSelection(selection => {
                console.log(`quickPick onDidChangeValue ${selection[0].label}`);
                quickPick.value = selection[0].label;
            });

            quickPick.show();
        });
        return output;
    }
}
