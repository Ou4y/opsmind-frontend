#!/bin/bash

# OpsMind Frontend - Quick Start Script
# This script starts the frontend server and opens it in your default browser

echo "🚀 Starting OpsMind Frontend..."
echo ""

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:3002"
else
    echo "⚠️  Warning: Backend is not responding at http://localhost:3002"
    echo "   Make sure to start the backend server before testing authentication"
fi

echo ""
echo "🌐 Starting HTTP server on port 5500..."
echo "📂 Serving files from: $(pwd)"
echo ""
echo "✨ Frontend will be available at: http://localhost:5500/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait a moment then open browser
(sleep 2 && open "http://localhost:5500/index.html") &

# Start Python HTTP server
python3 -m http.server 5500
