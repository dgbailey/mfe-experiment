#!/bin/bash

echo "🚀 Isolated Sentry Apps Launcher"
echo "================================"
echo ""
echo "This launcher starts separate, isolated apps to test Sentry configurations"
echo "without module interference."
echo ""

# Check if API server is running, start it if not
if ! curl -s http://localhost:3004/api/ping > /dev/null; then
    echo "🚀 Starting API server..."
    
    # Start API server with Sentry tracing
    (cd api-server && node server.js) &
    API_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for API server to start..."
    sleep 3
    
    if curl -s http://localhost:3004/api/ping > /dev/null; then
        echo "✅ API server started successfully"
    else
        echo "❌ Failed to start API server"
        exit 1
    fi
else
    echo "✅ API server is already running"
fi

echo ""

# Kill existing processes
pkill -f "webpack.*4001" 2>/dev/null
pkill -f "webpack.*4002" 2>/dev/null

echo "Available apps:"
echo ""
echo "1) 🟢 OPTION 1 - FEDERATED (host: 4001, remotes: 5001,5002)"
echo "   - Host: Sentry.init() + browser tracing"
echo "   - Remotes: 2 hubs WITHOUT browser tracing"
echo "   - Expected: Only host API calls have trace headers"
echo ""
echo "2) 🟡 OPTION 2 - FEDERATED (host: 4002, remotes: 6001,6002)"
echo "   - Host: Sentry.init() + browser tracing"
echo "   - Remotes: 2 hubs WITH browser tracing"
echo "   - Expected: All API calls have trace headers, possible accumulation"
echo ""
echo "3) 🚀 BOTH OPTIONS"
echo "   - Start both federated setups for comparison"
echo ""

read -p "Choose option (1, 2, or 3): " choice

case $choice in
    1)
        echo "🟢 Starting OPTION 1 FEDERATED..."
        echo "Starting remotes first..."
        (cd option1-remote1 && npm install && npm run dev) &
        REMOTE1_PID=$!
        (cd option1-remote2 && npm install && npm run dev) &
        REMOTE2_PID=$!
        
        echo "Waiting for remotes to start..."
        sleep 5
        
        echo "Starting host..."
        (cd app-clean && npm install && npm run dev) &
        HOST1_PID=$!
        
        echo "🌐 Open: http://localhost:4001"
        echo "   Remotes: http://localhost:5001 & http://localhost:5002"
        ;;
    2)
        echo "🟡 Starting OPTION 2 FEDERATED..."
        echo "Starting remotes first..."
        (cd option2-remote1 && npm install && npm run dev) &
        REMOTE3_PID=$!
        (cd option2-remote2 && npm install && npm run dev) &
        REMOTE4_PID=$!
        
        echo "Waiting for remotes to start..."
        sleep 5
        
        echo "Starting host..."
        (cd app-two-hubs && npm install && npm run dev) &
        HOST2_PID=$!
        
        echo "🌐 Open: http://localhost:4002"
        echo "   Remotes: http://localhost:6001 & http://localhost:6002"
        ;;
    3)
        echo "🚀 Starting BOTH FEDERATED OPTIONS..."
        echo "Starting all remotes..."
        (cd option1-remote1 && npm install && npm run dev) &
        REMOTE1_PID=$!
        (cd option1-remote2 && npm install && npm run dev) &
        REMOTE2_PID=$!
        (cd option2-remote1 && npm install && npm run dev) &
        REMOTE3_PID=$!
        (cd option2-remote2 && npm install && npm run dev) &
        REMOTE4_PID=$!
        
        echo "Waiting for remotes to start..."
        sleep 5
        
        echo "Starting hosts..."
        (cd app-clean && npm install && npm run dev) &
        HOST1_PID=$!
        (cd app-two-hubs && npm install && npm run dev) &
        HOST2_PID=$!
        
        echo ""
        echo "🌐 Open both federated apps:"
        echo "   Option 1: http://localhost:4001 (remotes: 5001,5002)"
        echo "   Option 2: http://localhost:4002 (remotes: 6001,6002)"
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "💡 Testing Tips:"
echo "  1. Open browser dev tools → Network tab"
echo "  2. Remotes automatically load and make API calls"
echo "  3. Compare sentry-trace and baggage headers between options"
echo "  4. Option 1: Only host should have trace headers"
echo "  5. Option 2: All calls (host + remotes) should have trace headers"
echo ""
echo "🔍 Key Questions to Answer:"
echo "  - Does Module Federation change trace header behavior?"
echo "  - Do multiple browser tracing instances in federated setup cause accumulation?"
echo "  - Can federated MFEs finally recreate the comma-separated sentry-trace pattern?"
echo ""
echo "Press Ctrl+C to stop all apps"

# Keep script running and handle cleanup
trap 'echo ""; echo "🛑 Stopping all apps and servers..."; kill $HOST1_PID $HOST2_PID $REMOTE1_PID $REMOTE2_PID $REMOTE3_PID $REMOTE4_PID $API_PID 2>/dev/null; exit' INT

# Wait for user interrupt
wait