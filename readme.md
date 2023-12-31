# Discord Websocket Text Inserter

This is a simple userscript that allows you to receive text from a websocket and send it to the current Discord channel.

## Usage

- Get [textractor_websocket](https://github.com/kuroahna/textractor_websocket) for VNs or [mpv_websocket](https://github.com/kuroahna/mpv_websocket) for anime and set it up.
- Install [Violentmonkey](https://violentmonkey.github.io/) for your browser.
- Install the script by **[clicking here](https://github.com/MarvNC/discord-websocket-text-inserter/raw/main/discord-websocket-inserter.user.js)**.
- Get your Discord token by following [this guide](https://gist.github.com/MarvNC/e601f3603df22f36ebd3102c501116c6).
- Go to the Discord channel where you want to send the text in your browser.
- Use the script through the userscript manager's popup menu as shown below.

![image](https://github.com/MarvNC/discord-websocket-text-inserter/assets/17340496/57d6b9a3-53e3-400d-bc46-224b273dbdfe)

> [!WARNING]
> This interacts with the Discord API and could be considered selfbotting. Use an alt account if this concerns you.

## Notes

- There is a ratelimit built in to lessen the likelihood of hitting the Discord message ratelimit. Because of this, you may notice a delay between the text being sent to the websocket and it appearing in Discord.
- Due to the content security policy, there is no way to use a websocket that is not on `127.0.0.1`.
- The recommended websocket extensions use the port `6677` by default, but if your websocket is on a different port, you can change it through the menu.
