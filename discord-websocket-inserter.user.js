// ==UserScript==
// @name        Discord Websocket Text Inserter
// @namespace   https://github.com/MarvNC
// @match       https://discord.com/channels/*
// @grant       none
// @version     1.0
// @author      MarvNC
// @description Receives text via Websocket and sends it to the Discord channel.
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// ==/UserScript==

let socket = null;

(async () => {
  const hasToken = !!getToken();
  // @ts-ignore
  GM_registerMenuCommand(
    `Set Token ${hasToken ? '(Currently Set)' : ''}`,
    () => {
      promptToken();
    }
  );
  // @ts-ignore
  GM_registerMenuCommand('Connect', () => {
    connect();
  });
})();

/**
 * @returns {string} The user's Discord token
 */
function promptToken() {
  const token = prompt('Please enter your Discord token:', '');
  if (!token) {
    alert('No token entered!');
    throw new Error('No token entered!');
  }
  // @ts-ignore
  GM_setValue('token', token);
  return token;
}

/**
 * @returns {string} The user's Discord token
 */
function getToken() {
  // @ts-ignore
  return GM_getValue('token');
}

/**
 * Gets a random 18 digit nonce
 * @returns {number} A random 18 digit nonce
 */
function getRandomNonce() {
  return Math.floor(Math.random() * 1000000000000000000);
}

/**
 * Sends a message to the current Discord channel
 * @param {string} message
 * @param {any?} channelId
 */
async function send(message, channelId = null) {
  if (!channelId) {
    channelId = document.location.pathname.split('/').pop();
  }
  const data = {
    content: message,
    tts: false,
    nonce: getRandomNonce(),
  };

  try {
    const response = await fetch(
      `https://discordapp.com/api/v9/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      console.log(`Sent Message: ${message}`);
    } else {
      console.error('Error sending message:');
      console.log(await response.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

let connected;
/**
 * Connects to the websocket
 */
function connect() {
  socket = new WebSocket('ws://127.0.0.1:6677');

  socket.onopen = () => {
    alert('Connected');
    onConnect();
  };

  socket.onmessage = (event) => {
    const message = event.data;
    send(message);
  };

  socket.onclose = () => {
    alert('Disconnected');
    onDisconnect();
  };
}

function onConnect() {
  // @ts-ignore
  GM_unregisterMenuCommand('Connect');
  // @ts-ignore
  GM_registerMenuCommand('Disconnect', () => {
    socket.close();
    onDisconnect();
  });
}

function onDisconnect() {
  // @ts-ignore
  GM_unregisterMenuCommand('Disconnect');
  // @ts-ignore
  GM_registerMenuCommand('Connect', () => {
    connect();
  });
}
