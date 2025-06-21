/** @typedef {import('pear-interface')} */ /* global Pear */

import Crypto from "hypercore-crypto";
import Hyperswarm from "hyperswarm";
import b4a from "b4a";

async function createChatRoom() {
  const topicBuffer = Crypto.randomBytes(32);
  joinSwarm(topicBuffer);
}

async function joinChatRoom(event) {
  event.preventDefault();
  const topicStr = document.getElementById("join-chat-room-topic").value;
  const topicBuffer = b4a.from(topicStr, "hex");
  joinSwarm(topicBuffer);
}

async function joinSwarm(topicBuffer) {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");

  const discovery = swarm.join(topicBuffer);
  await discovery.flushed();

  const topic = b4a.toString(topicBuffer, "hex");
  document.getElementById("chat-room-topic").textContent = topic;
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
}

function sendMessage(event) {
  event.preventDefault();
  const messageEl = document.getElementById("message");
  const message = messageEl.value;
  messageEl.value = "";

  onMessageAdded("You", message);

  const peers = [...swarm.connections];
  for (const peer of peers) {
    peer.write(message);
  }
}

function onMessageAdded(from, message) {
  const div = document.createElement("div");
  div.textContent = `${from}: ${message}`;
  document.getElementById("messages").appendChild(div);
}

// Unannounce public key before exiting the process (avoids DHT pollution)
Pear.teardown(() => {
  swarm.destroy();
});

// OTA updates (hot reload)
Pear.updates(() => Pear.reload());

const swarm = new Hyperswarm();

swarm.on("connection", (socket, peerInfo) => {
  const name = b4a.toString(peerInfo.publicKey, "hex").slice(0, 6);

  socket.on("data", (message) => onMessageAdded(name, message));

  socket.on("error", (error) => {
    console.error("peer error", error);
  });
});

swarm.on("update", () => {
  document.getElementById("peers-count").textContent = swarm.connections.size;
});

document
  .getElementById("create-chat-room")
  .addEventListener("click", createChatRoom);

document.getElementById("join-form").addEventListener("submit", joinChatRoom);

document.getElementById("message-form").addEventListener("submit", sendMessage);
