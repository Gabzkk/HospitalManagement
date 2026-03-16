const http = require('http');
const app = require('./app');
const { init: initSocket } = require('./socket');

const port = process.env.PORT || 3000;

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Attach Socket.IO
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
