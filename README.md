# ![redis icon](images/redis-128.png) Redis Command Runner

This extension allows connecting to a redis server and running commands against the server and displaying the results

## Features

### Redis Comand Runner: Connect

![connect](images/connect.png)

Connects to a Redis server. A prompt is displayed to enter the url of the server, then a prompt is displayed to allow a password to be entered, if a password is not required you can just press the enter key. The current connection status and server address is displayed in the bottom right hand of the editior window.

![connection status](images/connection-status.png)

### Redis Command Runner: Command

![command](images/command.png)

Sends a command to the Redis server and displays the server's output. A propmet ius displayed to enter the command, the whole command is entered into the prompt. Text for a command parameter that includes spaces needs to be enclosed in single or double quotes.

![command prompt](images/command-prompt.png)

![command output](images/command-output.png)

### Redis Command Runner: Disconnect

![disconnect](images/disconnect.png)

Disconnects from the redis server.

![disconnect status](images/disconnect-status.png)

## Requirements

Currently the extension does not hve any requirements or dependencies.

## Extension Settings

Currenty the extension does not create any VS Code settings.

## Known Issues and Feature Requests

Issues and feature request can be report via [Github](https://github.com/zerosandones/redis-command-runner/issues).

## Release Notes

The change log for the extension can be found [here](https://github.com/zerosandones/redis-command-runner/blob/master/CHANGELOG.md)

## License

MIT
