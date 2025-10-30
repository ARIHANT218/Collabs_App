const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');


require('dotenv').config();

const { connectDb } = require('./utils/db');
const { registerSocket } = require('./socket');

const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const documentRoutes = require('./routes/documents');
const searchRoutes = require('./routes/search');


const uploadRoutes = require('./routes/uploads');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const { errorHandler } = require('./utils/error');

const app = express();
const server = http.createServer(app);
const io = registerSocket(server, app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

//for upoading but not used
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan('dev'));


app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// app.get('/health', (_req, res) => res.json({ ok: true }));
// app.use('/uploads', express.static(UPLOAD_DIR));


app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);


connectDb().then(() => {
	server.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`);
	});
});

module.exports = { app, server, io };
