const { Server } = require('socket.io');

function registerSocket(httpServer, app) {
	const io = new Server(httpServer, {
		cors: {
			origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
			credentials: true
		}
	});

	io.on('connection', (socket) => {
		// Join room per document ....
		socket.on('doc:join', ({ documentId }) => {
			if (!documentId) return;
			socket.join(`doc:${documentId}`);
		});

	
		socket.on('doc:update', ({ documentId, delta }) => {
			if (!documentId) return;
			socket.to(`doc:${documentId}`).emit('doc:update', { delta });
		});

		
		socket.on('mention', (payload) => {
			if (!payload?.workspaceId) return;
			io.to(`ws:${payload.workspaceId}`).emit('mention', payload);
		});

		
		socket.on('ws:join', ({ workspaceId }) => {
			if (!workspaceId) return;
			socket.join(`ws:${workspaceId}`);
		});
	});

	app.set('io', io);
	return io;
}

module.exports = { registerSocket };
