const Sentry = require("@sentry/node");

// Initialize Sentry with automatic instrumentation
Sentry.init({
  dsn: "https://0fccb0e738f70633b0018f766a532906@o88872.ingest.us.sentry.io/4509726553735168",
  tracesSampleRate: 1.0,
  environment: "development",
});