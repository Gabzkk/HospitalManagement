const { Server } = require('socket.io');

let io = null;

/**
 * Attach Socket.IO to an existing HTTP server.
 * Call once from server.js.
 */
function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[WS] client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[WS] client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Broadcast an event to all connected clients.
 * @param {string} channel - e.g. 'patients', 'staff', 'appointments'
 * @param {object} data    - the payload
 */
function broadcast(channel, data) {
  if (io) io.emit(channel, data);
}

module.exports = { init, broadcast };
