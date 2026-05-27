const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Important for web testing
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEMPORARILY DISABLED rate limiting for testing
// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 100 });
// app.use('/api/', limiter);

// Basic Route
app.get('/', (req, res) => {
  res.send('Job & Internship Finder API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profiles');
const applicationRoutes = require('./routes/applications');
const matchingRoutes = require('./routes/matching');
const { sequelize } = require('./models');

// Safe Connection (NO SYNC)
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matching', matchingRoutes);

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', (data) => io.to(data.roomId).emit('receive_message', data));
  socket.on('disconnect', () => console.log('User disconnected'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
