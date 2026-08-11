const { Server } = require('socket.io');

let io = null;

/**
 * Inisialisasi Socket.io server
 * @param {import('http').Server} server 
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join room workspace
    socket.on('join:workspace', (workspaceId) => {
      const room = `workspace:${workspaceId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Leave room workspace
    socket.on('leave:workspace', (workspaceId) => {
      const room = `workspace:${workspaceId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    // Join room task
    socket.on('join:task', (taskId) => {
      const room = `task:${taskId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Leave room task
    socket.on('leave:task', (taskId) => {
      const room = `task:${taskId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  return io;
}

function emitToWorkspace(workspaceId, event, data) {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit(event, data);
  }
}

function emitToTask(taskId, event, data) {
  if (io) {
    io.to(`task:${taskId}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIo,
  emitToWorkspace,
  emitToTask,
};
