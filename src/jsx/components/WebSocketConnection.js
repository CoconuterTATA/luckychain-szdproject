// WebSocketConnection.js
let socket = null;

export function createSocket() {
  socket = new WebSocket('ws://150.158.173.17:3000/ws');

  socket.addEventListener('open', (event) => {
      console.log("WebSocket connection opened");
  });

  socket.addEventListener('close', (event) => {
      console.log("WebSocket connection closed");
  });

  socket.addEventListener('error', (event) => {
      console.log("WebSocket error: ", event);
  });

  return socket;
}

export function getSocket() {
  if (!socket) {
    return createSocket();
  }

  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
