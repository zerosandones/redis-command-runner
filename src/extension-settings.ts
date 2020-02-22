import { QuickPickItem, workspace, ConfigurationTarget, WorkspaceConfiguration } from "vscode";

export class ExtensionSettings {

    public get quickPickUrls(): QuickPickItem[] {
        return workspace.getConfiguration("redis-command-runner").get<string[]>('server-urls', []).map(label => ({label}));
    }

    public get quickPickCommands(): QuickPickItem[] {
        return workspace.getConfiguration("redis-command-runner").get<string[]>('commands', []).map(label => ({label}));
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
        let commands = workspace.getConfiguration("redis-command-runner").get<string[]>('commands', []);
        if (commands.includes(command)) {
            commands.splice(commands.indexOf(command), 1);
        }
        commands.unshift(command);
        if (commands.length > 10) {
            commands = commands.slice(0, 10);
        }
        this.saveSettings('commands', commands);
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

