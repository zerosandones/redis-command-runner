import { QuickPickItem, workspace, ConfigurationTarget } from "vscode";

export class ExtensionSettings {

    private _connectionUrls: string[] = [];

    public get connectionUrls(): string[] {
        return this._connectionUrls;
    }

    public get quickPickUrls(): QuickPickItem[] {
        return this.connectionUrls.map(label => ({label}));
    }

    public addConnectionUrl(url: string): void {
        if (!this._connectionUrls.includes(url)) {
            this._connectionUrls.unshift(url);
            if (this.connectionUrls.length > 5) {
                this.connectionUrls.slice(0, 4);
            }
        }
    }

    
}

