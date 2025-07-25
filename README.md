# Sentry MFE Demo - Browser Tracing in Micro-Frontends

Demo showing how Sentry browser tracing behaves in Module Federation with multiple hubs.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Check Sentry DSNs
Edit `.env` file with your Sentry project DSNs:
```env
SENTRY_DSN_HOST=https://your-host-dsn@sentry.io/project-id
SENTRY_DSN_REMOTE1=https://your-remote1-dsn@sentry.io/project-id  
SENTRY_DSN_REMOTE2=https://your-remote2-dsn@sentry.io/project-id
SENTRY_DSN_API=https://your-api-dsn@sentry.io/project-id
```

### 3. Start Demo
```bash
./launch-isolated-apps.sh
```

Choose option:
- **Option 1**: Only host has browser tracing (clean traces)
- **Option 2**: All components have browser tracing (baggage accumulation)
- **Both**: Run both for comparison

## 🔍 What to Test

### Open Browser Dev Tools
1. Go to **Network** tab
2. Look for requests to `/api/ping`
3. Check **Request Headers** for:
   - `sentry-trace` header
   - `baggage` header


## 📱 Apps & Ports

| App | Port | Tracing |
|-----|------|---------|
| **Option 1 Host** | 4001 | ✅ Browser tracing |
| Option 1 Remote 1 | 5001 | ❌ No tracing |
| Option 1 Remote 2 | 5002 | ❌ No tracing |
| **Option 2 Host** | 4002 | ✅ Browser tracing |
| Option 2 Remote 1 | 6001 | ✅ Browser tracing |  
| Option 2 Remote 2 | 6002 | ✅ Browser tracing |
| API Server | 3004 | ✅ Node tracing |

## 🛑 Stop Demo

Press `Ctrl+C` in the terminal running the launch script.

## 🐛 Troubleshooting

**Ports in use?**
```bash
lsof -i:3004,4001,4002,5001,5002,6001,6002 | grep LISTEN
```

**Missing dependencies?**
```bash
npm install
```

**CORS errors?**
API server should auto-start with proper CORS configuration.

## 📊 Key Findings

This demo reveals:
- **Option 1**: Clean trace propagation from host only
- **Option 2**: Baggage accumulation from multiple browser tracing instances
- **Distributed tracing**: Works across micro-frontends and API server