// ==UserScript==
// @name        Discord Websocket Text Inserter
// @namespace   https://github.com/MarvNC
// @match       https://discord.com/channels/*
// @grant       none
// @version     1.31
// @author      MarvNC
// @description Receives text via Websocket and sends it to the Discord channel.
// @homepageURL https://github.com/MarvNC/discord-websocket-text-inserter
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// ==/UserScript==

const MS_BETWEEN_MESSAGES = 1050;

let socket = null;
let port = 6677;

const tokenCommandID = 'set-token';
const portCommandID = 'set-port';

(async () => {
  const hasToken = !!getToken();
  if (!hasToken) {
    promptToken();
  }
  port = getPort();
  // @ts-ignore
  GM_registerMenuCommand(
    `Set Token ${hasToken ? '(Currently Set)' : ''}`,
    () => {
      promptToken();
    },
    {
      id: tokenCommandID,
    }
  );
  registerPortCommand();
  // @ts-ignore
  GM_registerMenuCommand('Connect', () => {
    connect();
  });
})();

function registerPortCommand() {
  // @ts-ignore
  GM_registerMenuCommand(`Set Port (Currently ${port})`, () => {
    promptPort();
  });
}

/**
 * @returns {number} The port to connect to
 */
function promptPort() {
  const port = prompt('Please enter the port to connect to:', '6677');
  if (!port) {
    alert('No port entered!');
    throw new Error('No port entered!');
  }
  // Parse the port to make sure it's a number
  const parsedPort = parseInt(port);
  if (isNaN(parsedPort)) {
    alert('Port must be a number!');
    throw new Error('Port must be a number!');
  }
  // @ts-ignore
  GM_setValue('port', parsedPort);

  return parsedPort;
}

/**
 * @returns {number} The port to connect to
 */
function getPort() {
  // @ts-ignore
  return GM_getValue('port', port);
}

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

let lastMessageSendTime = 0;
let queue = [];

/**
 * Sends a message to the current Discord channel
 * @param {string} message
 */
async function queueMessage(message) {
  const now = Date.now();
  queue.push(message);
  const timeSinceLastMessage = now - lastMessageSendTime;
  if (timeSinceLastMessage < MS_BETWEEN_MESSAGES) {
    console.log('Message sent too recently, queueing');
    if (!message) {
      return;
    }
    const msUntilNextMessage = 1 + MS_BETWEEN_MESSAGES - timeSinceLastMessage;
    setTimeout(() => {
      queueMessage('');
    }, msUntilNextMessage);
  } else {
    sendMessageQueue();
  }
}

/**
 *
 */
async function sendMessageQueue() {
  if (queue.length === 0) {
    return;
  }
  const message = queue.join('');
  if (!message) {
    return;
  }
  queue = [];
  const channelId = document.location.pathname.split('/').pop();
  lastMessageSendTime = Date.now();

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
      queue.unshift(message);
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
  socket = new WebSocket(`ws://127.0.0.1:${port}`);

  socket.onopen = () => {
    alert('Connected');
    onConnect();
  };

  socket.onmessage = (event) => {
    const message = event.data;
    queueMessage(message);
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
