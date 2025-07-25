import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Sentry from '@sentry/browser';

// OPTION 2: Sentry.init() + 2 hubs WITH browser tracing
console.log('[OPTION 2] Initializing Sentry with browser tracing...');

Sentry.init({
  dsn: process.env.SENTRY_DSN_HOST || 'https://cae9b37acac62c26d015cebf25e4b62d@o88872.ingest.us.sentry.io/4509633795522561',
  environment: 'development',
  tracesSampleRate: 1.0,
  release: 'main-app@1.0.0',
  integrations: [
    Sentry.browserTracingIntegration({
      tracePropagationTargets: ['localhost:3003', 'localhost:3004'],
    }),
  ],
  beforeSend: (event) => {
    console.log('[OPTION 2] Main app sending event:', event.event_id);
    return event;
  },
});

console.log('[OPTION 2] Main Sentry initialized - 2 hubs WITH browser tracing will be created');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);