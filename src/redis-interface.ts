import { window, QuickPickItem, CallHierarchyItem } from 'vscode';
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
            serverUrlPromise = this.promptForInput('Redis Server Url', 'redis://localhost:6379');
        } else {
            serverUrlPromise = this.selectOption('Redis Server Url', 'redis://localhost:6379', urls);
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

        const commands = this.extensionSettings.quickPickCommands;
        let commandPromise: Promise<string>;
        if (commands.length === 0) {
            commandPromise = this.promptForInput('Redis Command', 'LRANGE list 0 -1');
        } else {
            commandPromise = this.selectOption('Redis Command', 'LRANGE list 0 -1 ', commands);
        }

        commandPromise.then((commandString: string) => {
            if (commandString) {
                const command = commandString.substring(0, commandString.indexOf(' '));
                const commandArguments = commandString.substring(commandString.indexOf(' ') + 1).match(/[^"' ]+|(['"][^'"]*["'])/g);
                const commandArgsNoQuotes = commandArguments?.map(item => {
                    if (item.startsWith('"') || item.startsWith("'")) {
                        item = item.substring(1);

                        if (item.endsWith('"') || item.endsWith("'")) {
                            item = item.substring(0, item.length - 1);
                        }
                    }
                    return item;
                });
                console.log(`command ${command}, arguments ${commandArgsNoQuotes}`);
                this.client.sendCommand(command, commandArgsNoQuotes as [], (err, message) => {
                    this.messageHandler.displayReply(commandString, err, message);
                    if (!err) {
                        this.extensionSettings.addCommand(commandString);
                    }
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

    private promptForInput(prompt: string, placeHolder: string): Promise<string> {
        const options = {prompt: prompt, placeHolder: placeHolder};
        return new Promise((resolve, reject) => window.showInputBox(options)
            .then((input) => input ? resolve(input) : resolve()));
    }

    private selectOption(title: string, placeHolder: string, options: QuickPickItem[]): Promise<string> {

        const output = new Promise<string>((resolve, reject) => {
            const quickPick =  window.createQuickPick<QuickPickItem>();
            quickPick.items = options;
            quickPick.title = title;
            quickPick.placeholder = placeHolder;

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
