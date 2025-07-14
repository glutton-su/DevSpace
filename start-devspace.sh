#!/bin/bash

# DevSpace Platform Startup Script
echo "🚀 Starting DevSpace Platform..."
echo "================================"

# Check if MySQL Docker container is running
if ! docker ps | grep -q mysql-dev; then
    echo "📊 Starting MySQL Docker container..."
    docker start mysql-dev
    sleep 3
fi

# Start backend server in background
echo "🔧 Starting backend server..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend server in background  
echo "🎨 Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ DevSpace Platform started successfully!"
echo "================================"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "MySQL:    Docker container 'mysql-dev'"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================"

# Wait for user to stop the servers
trap "echo 'Stopping servers...' && kill $BACKEND_PID $FRONTEND_PID" INT

wait
