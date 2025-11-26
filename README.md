# CDS JNU Resume Maker

A fully client-side web application for creating professional resumes for CDS JNU M.A. (Applied Economics) students. The app generates downloadable `.tex` and `.pdf` files using a standardized LaTeX template - **no backend required!**

## Features

✨ **Key Highlights:**
- **100% Client-Side**: Works entirely in the browser - no backend server needed
- **GitHub Pages Compatible**: Can be hosted as a static site on GitHub Pages
- Clean, responsive form interface with step-by-step guidance
- Real-time validation (email, course codes, character limits)
- Comprehensive skills library with search and toggle functionality
- LaTeX preview before generation
- Multi-format output: `.tex`, `.pdf` (compiled via serverless API)
- Special character escaping and sanitization
- Support for dissertations or term papers (max 2)
- Unlimited course projects with validation
- Work experience and awards sections

## How It Works

This app uses a **serverless architecture**:
1. LaTeX is generated entirely in the browser using JavaScript
2. PDF compilation is done via the free [latex.ytotech.com](https://latex.ytotech.com) API
3. No TeX Live, pdflatex, or pandoc installation required!

## Quick Start

### Option 1: Use on GitHub Pages (Recommended)

Simply visit the hosted version at: `https://22f1000610.github.io/resume_maker/`

### Option 2: Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/22f1000610/resume_maker.git
   cd resume_maker
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

## Deployment

### Deploy to GitHub Pages (Automatic)

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the main branch.

To enable:
1. Go to your repository Settings > Pages
2. Under "Source", select "GitHub Actions"
3. Push to the main branch to trigger deployment

### Deploy to Vercel

If GitHub Pages doesn't meet your needs, you can deploy to Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Or connect to GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect React and configure the build

### Deploy to Netlify

```bash
cd frontend
npm run build
# Drag and drop the 'build' folder to Netlify
```

Or connect via GitHub for automatic deployments.

## Project Structure

```
resume_maker/
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── latexGenerator.js   # LaTeX generation & PDF API
│   │   ├── index.js            # React entry point
│   │   ├── index.css           # Tailwind CSS styles
│   │   └── skillsData.js       # Skills library
│   ├── package.json            # npm dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── postcss.config.js       # PostCSS configuration
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for deployment
├── scripts/
│   └── test_pdf_generation.js  # Test script for PDF generation
├── sample_data.json            # Sample resume data
├── templates/
│   └── resume_template.tex     # LaTeX template reference
└── README.md
```

## Usage Guide

1. **Open the application** (hosted or local)

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

4. **Generate & Compile PDF** to create the resume

5. **Download** your resume in `.tex` and `.pdf` formats

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

## Testing PDF Generation

You can test the PDF generation independently using Node.js:

```bash
node scripts/test_pdf_generation.js
```

This will generate a sample PDF from `sample_data.json` and save it to the `output/` folder.

## API Used

This app uses the free [latex.ytotech.com](https://latex.ytotech.com) API for PDF compilation:
- **Endpoint:** `https://latex.ytotech.com/builds/sync`
- **Compiler:** pdflatex
- **No API key required**
- **Free for public use**

## Browser Requirements

- Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Internet connection required for PDF compilation

## Troubleshooting

### PDF Compilation Fails

**Issue:** "LaTeX API request failed"
- **Solution:** Check your internet connection. The API requires network access.

**Issue:** "Unknown compilation error"
- **Solution:** Check for special characters in your input that may not be properly escaped.

### App Won't Load

**Issue:** Blank page
- **Solution:** Ensure JavaScript is enabled in your browser. Try clearing browser cache.

### Download Not Working

**Issue:** PDF doesn't download
- **Solution:** Ensure pop-ups are not blocked. Try a different browser.

## Security Notes

- All processing happens in your browser or via the LaTeX API
- No user data is stored on any server
- LaTeX special characters are automatically escaped to prevent injection

## Tech Stack

**Frontend (100% Client-Side):**
- React 18
- Tailwind CSS 3
- JavaScript ES6+

**PDF Generation:**
- External LaTeX API (latex.ytotech.com)

## Legacy Backend (Deprecated)

The original Flask backend (`backend/app.py`) is kept for reference but is **no longer required**. The app now works entirely without a backend server.

If you need the backend for custom deployments, see `DEPLOYMENT.md` for legacy instructions.

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Submit a pull request

## License

This project is created for CDS JNU students. Please ensure appropriate use and attribution.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the maintainers

---

**Note:** This application is designed specifically for CDS JNU M.A. (Applied Economics) students following the exact resume template specification.