// Instrument must be required first
require("./instrument");

const express = require('express');
const cors = require('cors');
const Sentry = require("@sentry/node");

const app = express();

// Enable CORS with Sentry trace headers
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:4001', 'http://localhost:4002'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'sentry-trace', 'baggage']
}));

// Middleware to log headers
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Simple counter endpoint
let requestCount = 0;
app.get('/api/counter', (req, res) => {
  requestCount++;
  res.json({
    count: requestCount,
    message: `This API has been called ${requestCount} times`,
    timestamp: new Date().toISOString()
  });
});

// Dog breeds endpoint
app.get('/api/breeds', (req, res) => {
  res.json({
    breeds: ['labrador', 'poodle', 'bulldog', 'beagle', 'golden retriever'],
    timestamp: new Date().toISOString()
  });
});

// Random dog info endpoint
app.get('/api/dog/:breed', (req, res) => {
  const { breed } = req.params;
  const facts = {
    beagle: 'Beagles are excellent hunting dogs!',
    labrador: 'Labradors are the most popular dog breed in the US!',
    poodle: 'Poodles are highly intelligent and trainable!',
    bulldog: 'Bulldogs are gentle despite their tough appearance!',
    'golden retriever': 'Golden Retrievers are great family dogs!'
  };
  
  res.json({
    breed,
    fact: facts[breed] || 'Dogs are amazing companions!',
    popularity: Math.floor(Math.random() * 100) + 1,
    timestamp: new Date().toISOString()
  });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    receivedHeaders: req.headers
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sentry error handler - must be after all routes and other error handlers
Sentry.setupExpressErrorHandler(app);

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Sentry tracing enabled - traces will be continued from incoming requests');
  console.log('Endpoints:');
  console.log('  GET /api/counter');
  console.log('  GET /api/breeds');
  console.log('  GET /api/dog/:breed');
  console.log('  GET /api/ping');
});