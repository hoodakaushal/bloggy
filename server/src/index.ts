import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { randomDelay, delayEndpoint } from './middleware/delay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET not set. Using default development secret."
  );
  process.env.JWT_SECRET = "development-secret-key-change-in-production";
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add random delay middleware for testing (10% of requests)
if (process.env.NODE_ENV === 'development') {
  app.use(randomDelay);
}

// Initialize database
initializeDatabase();

// Test delay endpoint
app.get('/api/delay/:ms', delayEndpoint);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Setup Socket.IO
import { Server as SocketIOServer } from 'socket.io';
import { setSocketIO } from './controllers/commentController.js';

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass io to comment controller for emitting events
setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a blog room
  socket.on('join-blog', (blogId: number) => {
    socket.join(`blog-${blogId}`);
    console.log(`Socket ${socket.id} joined blog-${blogId}`);
  });

  // Leave a blog room
  socket.on('leave-blog', (blogId: number) => {
    socket.leave(`blog-${blogId}`);
    console.log(`Socket ${socket.id} left blog-${blogId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

console.log('WebSocket server initialized');
