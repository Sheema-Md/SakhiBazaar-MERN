const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const activeUsers = new Map(); // maps userId (string) -> socketId (string)

const initSocket = (server) => {
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.includes(origin));
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  // Socket middleware for JWT verification during connection handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        return next();
      } catch (err) {
        console.error('Socket authentication failed:', err.message);
        // We still allow connection as guest/unmapped to support grace failures,
        // but it will print connection errors
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId || 'Guest'})`);

    // Map the user ID if authenticated
    if (socket.userId) {
      activeUsers.set(socket.userId.toString(), socket.id);
      console.log(`Mapped active user: ${socket.userId} to socket ${socket.id}`);
    }

    // Explicit fallback registration event
    socket.on('register_user', (userId) => {
      if (userId) {
        socket.userId = userId;
        activeUsers.set(userId.toString(), socket.id);
        console.log(`Manually registered user: ${userId} to socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        activeUsers.delete(socket.userId.toString());
        console.log(`Removed active user mapping: ${socket.userId}`);
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized! Call initSocket first.');
  }
  return io;
};

const getActiveUserSocketId = (userId) => {
  if (!userId) return null;
  return activeUsers.get(userId.toString()) || null;
};

module.exports = { initSocket, getIo, getActiveUserSocketId };
