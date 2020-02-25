import { QuickPickItem, workspace, ConfigurationTarget, WorkspaceConfiguration } from "vscode";

export class ExtensionSettings {

    private _commands: string[] = [];

    public get quickPickUrls(): QuickPickItem[] {
        return workspace.getConfiguration("redis-command-runner").get<string[]>('server-urls', []).map(label => ({label}));
    }

    public get quickPickCommands(): QuickPickItem[] {
        return this._commands.map(label => ({label}));
    }

    public addConnectionUrl(url: string): void {
        let connectionUrls = workspace.getConfiguration("redis-command-runner").get<string[]>('server-urls', []);
        if (connectionUrls.includes(url)) {
            connectionUrls.splice(connectionUrls.indexOf(url), 1);
        }
        connectionUrls.unshift(url);
        if (connectionUrls.length > 5) {
            connectionUrls = connectionUrls.slice(0, 5);
        }
        this.saveSettings('server-urls', connectionUrls);
    }

    public addCommand(command: string): void {

        if (this._commands.includes(command)) {
            this._commands.splice(this._commands.indexOf(command), 1);
        }
        this._commands.unshift(command);
        if (this._commands.length > 15) {
            this._commands = this._commands.slice(0, 15);
        }
    }

    private saveSettings(settingName: string, settingArray: string[]) {
        workspace.getConfiguration("redis-command-runner").update(settingName, settingArray, ConfigurationTarget.Global).then(
            () => {
                console.log(`settings updated ${settingName}`);
            },
            (reason: any) => {
                console.error(`error saving settings ${reason}`);
            }
        );
    }
}

