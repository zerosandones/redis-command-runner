import { QuickPickItem, workspace, ConfigurationTarget } from "vscode";

export class ExtensionSettings {

    private _connectionUrls: string[] = [];

    constructor() {
        const config = workspace.getConfiguration("redis-command-runner");
        this._connectionUrls = config.get<string[]>('server-urls', []);
    }

    public get connectionUrls(): string[] {
        return this._connectionUrls;
    }

    public get quickPickUrls(): QuickPickItem[] {
        return this.connectionUrls.map(label => ({label}));
    }

    public addConnectionUrl(url: string): void {
        if (this._connectionUrls.includes(url)) {
            this._connectionUrls.splice(this._connectionUrls.indexOf(url), 1);
        }
        this._connectionUrls.unshift(url);
        if (this.connectionUrls.length > 5) {
            this.connectionUrls.slice(0, 4);
        }
        this.saveConnectionURls(this._connectionUrls);
    }

    private saveConnectionURls(connectionURLs: string[]) {
        console.log('saving settings');
        const config = workspace.getConfiguration("redis-command-runner");
        config.update('server-urls', connectionURLs, ConfigurationTarget.Global).then(() => {
            console.log('settings updated');
        });
    }
}

