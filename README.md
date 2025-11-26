# CDS JNU Resume Maker

A comprehensive web application for creating professional resumes for CDS JNU M.A. (Applied Economics) students. The app generates downloadable `.tex`, `.pdf`, and `.docx` files using a standardized LaTeX template.

## Features

✨ **Key Highlights:**
- Clean, responsive form interface with step-by-step guidance
- Real-time validation (email, course codes, character limits)
- Comprehensive skills library with search and toggle functionality
- LaTeX preview before generation
- Multi-format output: `.tex`, `.pdf` (compiled), `.docx` (converted)
- Special character escaping and sanitization
- Support for dissertations or term papers (max 2)
- Unlimited course projects with validation
- Work experience and awards sections
- **Serverless-friendly**: Supports external LaTeX API for PDF generation (no TeX Live required)

## Prerequisites

Before installation, ensure you have:

- **Python 3.8+** - Backend server
- **Node.js 14+** and **npm** - Frontend application

### Optional Dependencies (for local compilation mode)
- **TeX Live** (pdflatex) - PDF compilation (only needed if using `LATEX_COMPILE_MODE=local`)
  - Ubuntu/Debian: `sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra`
  - macOS: `brew install --cask mactex-no-gui`
  - Windows: Download from [TeX Live](https://www.tug.org/texlive/)
- **Pandoc** - DOCX conversion (optional, for `.docx` output)
  - Ubuntu/Debian: `sudo apt-get install pandoc`
  - macOS: `brew install pandoc`
  - Windows: Download from [Pandoc](https://pandoc.org/installing.html)

> **Note:** By default, the app uses an external LaTeX API for PDF generation, making it serverless-friendly without requiring TeX Live installation.

## Quick Start

### Automated Installation

Run the installation script:

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/22f1000610/resume_maker.git
   cd resume_maker
   ```

2. **Set up Python backend:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up React frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Running the Application

### Start Backend Server

In one terminal:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python backend/app.py
```

The backend will start on `http://localhost:5000`

### Start Frontend Development Server

In another terminal:
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Project Structure

```
resume_maker/
├── backend/
│   └── app.py              # Flask server with LaTeX generation logic
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   ├── index.css       # Tailwind CSS styles
│   │   └── skillsData.js   # Skills library
│   ├── package.json        # npm dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS configuration
├── templates/
│   └── resume_template.tex # LaTeX template (exact specification)
├── scripts/
│   └── install.sh          # Installation script
├── tests/
│   └── test_validation.py  # Unit tests
├── output/                 # Generated files (auto-created)
├── sample_data.json        # Sample resume data
├── requirements.txt        # Python dependencies
├── .gitignore
└── README.md
```

## Usage Guide

1. **Open the application** at `http://localhost:3000`

2. **Fill out the form** across 8 steps:
   - Step 1: Personal information
   - Step 2: Education (SSC, HSC, UG, PG)
   - Step 3: Dissertation or Term Papers
   - Step 4: Course Projects
   - Step 5: Technical Skills (select from library)
   - Step 6: Work Experience & Internships
   - Step 7: Awards & Achievements
   - Step 8: Preview & Generate

3. **Preview LaTeX** to see the generated code

4. **Generate & Compile** to create all three file formats

5. **Download** your resume in `.tex`, `.pdf`, and `.docx` formats

## Validation Rules

The application enforces the following constraints:

- **Names:** Max 40 characters each
- **Email:** Standard email format validation
- **Institute names:** Max 35 characters
- **Course codes:** Must match `AE-XXX` format (e.g., AE-201)
- **Description lines:** Max 120 characters each
- **Term papers:** Maximum 2 allowed
- **Experience bullets:** Max 4 per entry, 120 chars each
- **Special characters:** Automatically escaped for LaTeX

## Testing

Run the test suite:

```bash
source venv/bin/activate
python -m pytest tests/test_validation.py -v
```

Or using unittest:

```bash
python -m unittest tests/test_validation.py
```

## Sample Data

A sample JSON file (`sample_data.json`) is provided for testing. You can use this to:
- Test the backend API directly
- Understand the expected data structure
- Pre-fill the form for development

## API Endpoints

### Backend API

- `POST /api/generate` - Generate resume files
  - Input: JSON data (see sample_data.json)
  - Output: Generated files and preview
  
- `POST /api/preview-latex` - Generate LaTeX preview only
  - Input: JSON data
  - Output: LaTeX code string
  
- `GET /api/download/<filename>` - Download generated file
  - Input: Filename
  - Output: File download

- `GET /health` - Health check
  - Output: `{"status": "healthy"}`

## Environment Variables

Configure the application using these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LATEX_COMPILE_MODE` | `api` | Compilation mode: `api` (serverless-friendly, uses external API) or `local` (requires TeX Live) |
| `LATEX_API_URL` | `https://latex.ytotech.com/builds/sync` | Custom LaTeX API endpoint (only used when `LATEX_COMPILE_MODE=api`) |
| `REACT_APP_API_URL` | `http://localhost:5000` | Backend API URL for frontend |

### Serverless Deployment

For serverless platforms (Vercel, AWS Lambda, Google Cloud Functions, etc.), use the default `api` mode:

```bash
# No TeX Live needed - uses external LaTeX API
LATEX_COMPILE_MODE=api
```

### Local Development with TeX Live

If you prefer local PDF compilation:

```bash
# Requires TeX Live installed
LATEX_COMPILE_MODE=local
```

## Troubleshooting

### PDF Compilation Fails

**Issue:** "pdflatex not found"
- **Solution:** Either install TeX Live (see Prerequisites) or use `LATEX_COMPILE_MODE=api` (default) to use the external LaTeX API

**Issue:** "Compilation failed" error
- **Solution:** Check LaTeX logs in the error message. Common issues:
  - Special characters not properly escaped
  - Missing logo file
  - Invalid LaTeX syntax in user input

**Issue:** LaTeX API timeout or network error
- **Solution:** Check your internet connection. The external API (latex.ytotech.com) requires network access.

### DOCX Conversion Fails

**Issue:** "pandoc not found"
- **Solution:** Install Pandoc (see Prerequisites) or accept PDF-only output (DOCX is optional)

**Issue:** DOCX has formatting issues
- **Expected:** Pandoc conversion is "best effort". Some LaTeX formatting may not translate perfectly to DOCX.

### Frontend Won't Start

**Issue:** Port 3000 already in use
- **Solution:** Kill the process using port 3000 or change the port in package.json

**Issue:** Module not found errors
- **Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Backend Errors

**Issue:** "Module not found"
- **Solution:** Ensure virtual environment is activated and dependencies are installed

**Issue:** CORS errors
- **Solution:** Ensure backend is running on port 5000 and frontend on port 3000

## Security Notes

- LaTeX compilation runs with `-no-shell-escape` flag for security
- All user input is sanitized and LaTeX special characters are escaped
- File uploads are validated
- Temporary compilation directories are cleaned up automatically

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS 3
- Axios for API calls

**Backend:**
- Flask (Python web framework)
- Flask-CORS (Cross-origin support)
- subprocess (LaTeX/Pandoc execution)

**Document Generation:**
- LaTeX (TeX Live)
- Pandoc (document conversion)

## License

This project is created for CDS JNU students. Please ensure appropriate use and attribution.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the maintainers

---

**Note:** This application is designed specifically for CDS JNU M.A. (Applied Economics) students following the exact resume template specification.