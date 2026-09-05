import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

global.io = io;

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dealflow360';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Express HTTP Request Logger Middleware (Displays every incoming request on Render logs)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📥 ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health Check Routes
app.get('/', (req, res) => {
  res.json({
    service: 'DEALFLOW360 Backend Engine',
    status: 'ONLINE',
    time: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DEALFLOW360 API is healthy.' });
});

// Mount API Routes
app.use('/api', apiRoutes);

// Attach io to express app so routes can broadcast events
app.set('io', io);

// Socket.IO Real-Time Chat & Business Event Engine
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('join_room', (roomId) => {
    if (roomId) {
      socket.join(String(roomId));
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    }
  });

  socket.on('leave_room', (roomId) => {
    if (roomId) {
      socket.leave(String(roomId));
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    }
  });

  socket.on('send_message', (data) => {
    const roomId = data.roomId || data.conversationId || data.dealNumber || data.dealId;
    console.log(`💬 Message sent in room [${roomId}]:`, data.text);

    // Broadcast message to room members (including sender or excluding based on front-end needs)
    if (roomId) {
      io.to(String(roomId)).emit('receive_message', {
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      });
    } else {
      io.emit('receive_message', data);
    }
  });

  socket.on('typing', (data) => {
    const roomId = data.roomId || data.conversationId || data.dealNumber;
    if (roomId) {
      socket.to(String(roomId)).emit('user_typing', data);
    }
  });

  socket.on('stop_typing', (data) => {
    const roomId = data.roomId || data.conversationId || data.dealNumber;
    if (roomId) {
      socket.to(String(roomId)).emit('user_stop_typing', data);
    }
  });

  socket.on('quote_locked', (data) => {
    const roomId = data.roomId || data.dealNumber;
    if (roomId) {
      io.to(String(roomId)).emit('business_event', { type: 'QUOTE_LOCKED', data });
    } else {
      io.emit('business_event', { type: 'QUOTE_LOCKED', data });
    }
  });

  socket.on('approval_updated', (data) => {
    const roomId = data.roomId || data.dealNumber;
    if (roomId) {
      io.to(String(roomId)).emit('business_event', { type: 'APPROVAL_UPDATED', data });
    } else {
      io.emit('business_event', { type: 'APPROVAL_UPDATED', data });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Connect to Local Offline MongoDB Database
connectDB();

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 DEALFLOW360 Server running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
