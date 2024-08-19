const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const httpProxy = require('http-proxy');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const appRoutes = require('./routes/appRoutes');

const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer({ 
  ws: true,
  xfwd: true // Add this to preserve original client IP
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Adjust this to your frontend URL
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Web App Launcher API' });
});

// WebSocket proxy
server.on('upgrade', (req, socket, head) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetPort = parsedUrl.searchParams.get('port');
  
  if (targetPort) {
    console.log(`Proxying WebSocket connection to port ${targetPort}`);
    proxy.ws(req, socket, head, { 
      target: `ws://localhost:${targetPort}`,
      ws: true,
      binary: true
    }, (err) => {
      if (err) {
        console.error('WebSocket proxy error:', err);
        socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      }
    });

    // Add these event listeners
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('close', (hadError) => {
      console.log('Socket closed. Had error:', hadError);
    });
  } else {
    console.log('No port specified for WebSocket connection');
    socket.destroy();
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});