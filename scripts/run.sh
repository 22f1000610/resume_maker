#!/bin/bash
# Run script for Resume Maker App

echo "========================================="
echo "Starting Resume Maker Application"
echo "========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required dependencies
echo "Checking dependencies..."

if ! command_exists python3; then
    echo "ERROR: Python 3 is not installed."
    exit 1
fi

if ! command_exists node; then
    echo "ERROR: Node.js is not installed."
    exit 1
fi

if ! command_exists pdflatex; then
    echo "WARNING: pdflatex not found. PDF generation will fail."
fi

if ! command_exists pandoc; then
    echo "WARNING: pandoc not found. DOCX generation will fail."
fi

echo "✓ Dependencies checked"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run scripts/install.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start backend in background
echo "Starting backend server..."
python3 backend/app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "✓ Backend server started on http://localhost:5000"
echo ""

# Start frontend
echo "Starting frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend dev server
npm start &
FRONTEND_PID=$!

cd ..

# Wait for user interrupt
echo ""
echo "========================================="
echo "Resume Maker is now running!"
echo "========================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Trap Ctrl+C and cleanup
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    # Kill any remaining node/python processes from this script
    pkill -P $$ 2>/dev/null
    echo "✓ Servers stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for processes
wait
