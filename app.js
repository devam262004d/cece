// app.js

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDb = require('./config/mongo');
const authRouter = require('./Auth/authRouter');
const interviewJobRouter = require('./interviewJob/interviewJobRouter');
const InterviewJobs = require('./interviewJob/interviewJob');

require('dotenv').config();

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDb();

// Middlewares
app.use(morgan('dev'));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Use env var in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
  },
}));

// Passport setup
require('./passport/googleStrategy')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/interviewJob', interviewJobRouter);

// Home route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Socket.IO real-time logic
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  console.log('📱 Device info:', socket.handshake.headers['user-agent']);

  socket.on('check-password', async ({ roomId, password }) => {
    try {
      const job = await InterviewJobs.findOne({ interviewCode: roomId });
      if (!job) {
        socket.emit('error', { message: 'Job not found' });
        return;
      }
      if (job.password !== password) {
        socket.emit('error', { message: 'Password is incorrect' });
        return;
      }
      socket.emit('password-is-correct', { roomId });
    } catch (err) {
      console.error('Error in check-password:', err);
      socket.emit('error', { message: 'Server error' });
    }
  });

  socket.on('join-room', ({ roomId, role }) => {
    let participants = activeRooms.get(roomId) || [];

    if (participants.includes(socket.id)) {
      console.log('🚫 Already joined:', socket.id);
      return;
    }

    if (participants.length === 0) {
      if (role !== 'interviewer') {
        socket.emit('error', { message: 'Please wait for the interviewer to join' });
      } else {
        socket.join(roomId);
        participants.push(socket.id);
        activeRooms.set(roomId, participants);
        console.log('✅ Interviewer joined:', socket.id);
      }
    } else if (participants.length === 1) {
      if (role !== 'candidate') {
        socket.emit('error', { message: 'Only candidate can join at this time' });
      } else {
        socket.join(roomId);
        participants.push(socket.id);
        activeRooms.set(roomId, participants);
        console.log('✅ Candidate joined:', socket.id);
        socket.to(roomId).emit('user-joined');
      }
    } else {
      socket.emit('error', { message: 'Room is full' });
    }
  });

  socket.on('offer', ({ offer, roomId }) => {
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ answer, roomId }) => {
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ candidate, roomId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    for (const [roomId, participants] of activeRooms.entries()) {
      const index = participants.indexOf(socket.id);
      if (index !== -1) {
        participants.splice(index, 1);
        console.log(`🧹 Removed ${socket.id} from room ${roomId}`);

        if (participants.length === 0) {
          activeRooms.delete(roomId);
          console.log(`🗑️ Deleted empty room ${roomId}`);
        } else {
          activeRooms.set(roomId, participants);
        }
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
