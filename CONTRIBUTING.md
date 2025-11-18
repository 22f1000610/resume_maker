# Contributing to Resume Maker

Thank you for your interest in contributing to the CDS JNU Resume Maker!

## Development Setup

1. Fork and clone the repository
2. Run the installation script: `./scripts/install.sh`
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

## Code Structure

### Backend (`backend/`)
- `app.py` - Flask server with all API endpoints and LaTeX generation logic
- Functions are organized by purpose:
  - Validation functions
  - Escaping and sanitization
  - Block generation (dissertation, projects, experience, etc.)
  - Main LaTeX generation
  - API endpoints

### Frontend (`frontend/src/`)
- `App.js` - Main React component with form logic
- `skillsData.js` - Skills library and categories
- `index.css` - Tailwind styles
- Component structure uses React hooks for state management

### Templates (`templates/`)
- `resume_template.tex` - **DO NOT MODIFY** - This is the exact LaTeX template as specified

### Tests (`tests/`)
- `test_validation.py` - Unit tests for validation rules

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guide
- Use descriptive function and variable names
- Add docstrings to all functions
- Escape all user input for LaTeX
- Handle errors gracefully with appropriate HTTP status codes

### JavaScript (Frontend)
- Use functional components with hooks
- Keep components focused and single-purpose
- Add comments for complex logic
- Validate user input on both client and server side

### LaTeX
- Never modify the template structure
- Only replace placeholders with sanitized content
- Escape special characters: `# $ % & ~ _ ^ \ { }`
- Test PDF compilation after any changes

## Adding New Features

### Adding a New Form Field

1. **Update the data structure** in `sample_data.json`
2. **Add validation** in `backend/app.py`
3. **Add form input** in `frontend/src/App.js`
4. **Update LaTeX generation** to use the new field
5. **Add tests** for the new validation rules

### Adding a New Skills Category

1. **Update `skillsData.js`** with new category and skills
2. **Update `generate_latex()`** to include the new category
3. **Update the template** if needed (only if approved)
4. **Test** that skills are properly rendered

## Testing

### Running Tests

```bash
# Run all tests
./scripts/test.sh

# Run specific test
python -m unittest tests.test_validation.TestValidation.test_email_validation
```

### Adding Tests

Add test cases to `tests/test_validation.py`:

```python
def test_your_new_feature(self):
    """Test description"""
    # Test code here
    self.assertEqual(expected, actual)
```

### Manual Testing Checklist

- [ ] Fill out complete form with valid data
- [ ] Test validation for each field
- [ ] Test with special characters in all fields
- [ ] Verify LaTeX preview displays correctly
- [ ] Generate and download all three file formats
- [ ] Verify PDF renders correctly
- [ ] Test edge cases (empty sections, max limits, etc.)

## Pull Request Process

1. **Update documentation** if you've added/changed features
2. **Add tests** for new functionality
3. **Run the test suite** and ensure all tests pass
4. **Test manually** with the application running
5. **Commit with clear messages**:
   ```
   Add feature: Brief description
   
   - Detail 1
   - Detail 2
   ```
6. **Push to your fork** and create a Pull Request
7. **Describe your changes** in the PR description

## Common Development Tasks

### Testing API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Generate resume with sample data
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d @sample_data.json

# Preview LaTeX
curl -X POST http://localhost:5000/api/preview-latex \
  -H "Content-Type: application/json" \
  -d @sample_data.json
```

### Debugging LaTeX Compilation

1. Check the LaTeX output in the API response
2. Look for unescaped special characters
3. Verify all placeholders are replaced
4. Test the LaTeX file independently:
   ```bash
   pdflatex -interaction=nonstopmode test.tex
   ```
5. Check compilation logs for specific errors

### Testing Frontend Changes

```bash
cd frontend
npm start
```

Then open `http://localhost:3000` and test your changes.

### Building Frontend for Production

```bash
cd frontend
npm run build
```

## Security Considerations

- **Always escape user input** before inserting into LaTeX
- **Validate all inputs** on both frontend and backend
- **Use `-no-shell-escape`** flag for pdflatex
- **Sanitize filenames** before file operations
- **Never trust client-side validation alone**

## Documentation

When adding features, update:
- `README.md` - Main documentation
- `QUICKSTART.md` - If it affects getting started
- Inline code comments - For complex logic
- Function docstrings - For all new functions

## Questions?

If you have questions:
1. Check existing documentation
2. Review the code and comments
3. Look at similar existing implementations
4. Open an issue for discussion

## Code of Conduct

- Be respectful and constructive
- Focus on what is best for the project
- Show empathy towards others
- Accept constructive criticism gracefully

Thank you for contributing!
