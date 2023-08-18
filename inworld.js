import dotenv from 'dotenv';
dotenv.config();

import { Agent } from 'upstreet';


if (!process.env.INWORLD_KEY) {
  throw new Error('INWORLD_KEY env variable is required');
}

if (!process.env.INWORLD_SECRET) {
  throw new Error('INWORLD_SECRET env variable is required');
}

if (!process.env.INWORLD_SCENE) {
  throw new Error('INWORLD_SCENE env variable is required');
}

import {
  InworldClient,
  status,
} from '@inworld/nodejs-sdk';

const sendMessage = async (message, speaker) => {
  const client = await createInworldClient(message, speaker);
  client.sendText(message);
};

class Storage {
  get(key) {
    return this[key];
  }

  set(key, value) {
    this[key] = value;
  }
}

const storage = new Storage();

const createInworldClient = async (message, speaker) => {
  const key = speaker;
  const client = new InworldClient()
    .setOnSession({
      get: () => storage.get(key),
      set: (session) => storage.set(key, session),
    })
    .setApiKey({
      key: process.env.INWORLD_KEY,
      secret: process.env.INWORLD_SECRET,
    })
    .setConfiguration({ capabilities: { audio: false } })
    .setScene(process.env.INWORLD_SCENE)
    .setOnError(handleError(message, speaker))
    .setOnMessage((packet) => {
      if (packet.isInteractionEnd()) {
        client.close();
        return;
      }

      if (packet.isText() && packet.text.final) {
        const message = packet.text.text;
        agent.speak(message)
      }
    })
    .build();

  return client;
};

const handleError = (message, speaker) => {
  return (err) => {
    switch (err.code) {
      case status.ABORTED:
      case status.CANCELLED:
        break;
      default:
        console.error(`Error: ${err.message}`);
        storage.delete(getKey(message));
        sendMessage(message, speaker);
        break;
    }
  };
};

const agent = new Agent();

async function onMessage(message) {
  print("received message", message)
  const { text, speaker } = message;
  await sendMessage(text, speaker);
}

async function start() {
  await agent.connect();
  agent.addEventListener('message', onMessage);

}

start();