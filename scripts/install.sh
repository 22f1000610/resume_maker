#!/bin/bash
# Installation script for Resume Maker App

echo "========================================="
echo "Resume Maker Installation Script"
echo "========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python
if ! command_exists python3; then
    echo "ERROR: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check for Node.js
if ! command_exists node; then
    echo "ERROR: Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check for npm
if ! command_exists npm; then
    echo "ERROR: npm is not installed. Please install npm."
    exit 1
fi

echo "✓ npm found: $(npm --version)"

# Check for pdflatex
if ! command_exists pdflatex; then
    echo "WARNING: pdflatex is not installed. Installing TeX Live..."
    echo "Please run: sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra"
    echo "Or on macOS: brew install --cask mactex-no-gui"
    echo ""
    read -p "Do you want to continue without pdflatex? (PDF generation will fail) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ pdflatex found"
fi

# Check for pandoc
if ! command_exists pandoc; then
    echo "WARNING: pandoc is not installed. Installing..."
    echo "Please run: sudo apt-get install pandoc"
    echo "Or on macOS: brew install pandoc"
    echo ""
    read -p "Do you want to continue without pandoc? (DOCX generation will fail) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ pandoc found: $(pandoc --version | head -n 1)"
fi

echo ""
echo "========================================="
echo "Installing Backend Dependencies"
echo "========================================="

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python packages..."
pip install -r requirements.txt

echo ""
echo "========================================="
echo "Installing Frontend Dependencies"
echo "========================================="

cd frontend

# Install npm packages
echo "Installing npm packages..."
npm install

cd ..

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "To run the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   source venv/bin/activate"
echo "   python backend/app.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open your browser to http://localhost:3000"
echo ""
echo "========================================="
