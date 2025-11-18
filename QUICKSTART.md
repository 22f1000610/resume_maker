# Quick Start Guide

This guide will help you get the Resume Maker application up and running in minutes.

## Prerequisites

Ensure you have installed:
- Python 3.8+
- Node.js 14+
- TeX Live (for PDF generation)
- Pandoc (for DOCX conversion)

## Installation

### Option 1: Automated Installation (Recommended)

```bash
./scripts/install.sh
```

This will:
- Create a Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Verify required tools are available

### Option 2: Manual Installation

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

## Running the Application

### Option 1: Using the Run Script (Recommended)

```bash
./scripts/run.sh
```

This will start both backend and frontend servers automatically.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Using the Application

1. **Open your browser** to `http://localhost:3000`

2. **Fill out the form** step by step:
   - Personal Information
   - Education Details
   - Dissertation/Term Papers
   - Course Projects
   - Select Skills from the library
   - Add Experience (optional)
   - Add Awards (optional)

3. **Preview** your LaTeX code to verify formatting

4. **Generate** your resume files

5. **Download** all three formats:
   - `.tex` - LaTeX source file
   - `.pdf` - Compiled PDF
   - `.docx` - Word document

## Testing

Run the test suite to verify everything works:

```bash
./scripts/test.sh
```

## Tips

### Character Limits
- Names: 40 characters each
- Institute names: 35 characters
- Description lines: 120 characters
- Course codes: Must be `AE-XXX` format

### Skills Selection
- Use the search bar to quickly find skills
- Click on skills to toggle selection
- Selected skills appear highlighted
- Only select skills you actually possess

### Common Issues

**Port already in use:**
```bash
# Kill existing process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Kill existing process on port 5000
sudo lsof -ti:5000 | xargs kill -9
```

**PDF generation fails:**
- Ensure TeX Live is installed
- Check that special characters in your input are handled correctly
- Review the error message for specific LaTeX errors

**Module not found:**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

## Sample Data

A sample data file is provided at `sample_data.json`. You can:
- Use it to test the API directly
- Reference it to understand the data structure
- Load it into the frontend for testing

## Getting Help

If you encounter issues:
1. Check the main README.md for detailed documentation
2. Review the error messages carefully
3. Ensure all dependencies are installed
4. Try running the test script: `./scripts/test.sh`

## Next Steps

After successfully generating your first resume:
- Customize the skills library if needed
- Add your actual education and experience details
- Review the generated PDF for any formatting issues
- Save your data as a JSON file for future updates
