# API Documentation

This document describes the REST API endpoints for the Resume Maker backend.

## Base URL

```
http://localhost:5000
```

In production, this will be your deployed backend URL.

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy"
}
```

**Status Code:** `200 OK`

---

### 2. Preview LaTeX

Generate LaTeX code without compiling to PDF.

**Endpoint:** `POST /api/preview-latex`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** See [Data Schema](#data-schema) below

**Response:**
```json
{
  "success": true,
  "latex": "\\documentclass[a4paper,10pt]{article}\n..."
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid input data
- `500 Internal Server Error` - Server error

---

### 3. Generate Resume

Generate LaTeX, compile PDF, and convert to DOCX.

**Endpoint:** `POST /api/generate`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** See [Data Schema](#data-schema) below

**Response:**
```json
{
  "success": true,
  "message": "Resume generated successfully",
  "files": {
    "tex": "/api/download/firstname_lastname.tex",
    "pdf": "/api/download/firstname_lastname.pdf",
    "docx": "/api/download/firstname_lastname.docx"
  },
  "latex_preview": "\\documentclass[a4paper,10pt]{article}\n..."
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation failed
- `500 Internal Server Error` - Compilation or conversion failed

---

### 4. Download File

Download a generated file.

**Endpoint:** `GET /api/download/<filename>`

**Parameters:**
- `filename` - Name of the file to download (e.g., `john_doe.pdf`)

**Response:** Binary file download

**Status Codes:**
- `200 OK` - File found and served
- `404 Not Found` - File doesn't exist

---

## Data Schema

### Complete JSON Structure

```json
{
  "first_name": "string (required, max 40 chars)",
  "last_name": "string (required, max 40 chars)",
  "email": "string (required, email format)",
  "program": "Applied Economics",
  "batch": "2024-26 | 2025-27 | 2026-28",
  "gender": "Male | Female | Other | Prefer not to say",
  
  "ssc": {
    "board": "string",
    "institute_short": "string (max 35 chars)",
    "year": "string (e.g., '2018')",
    "grade_x": "string (numeric or grade)",
    "grade_y": "string (optional, for X/Y format)"
  },
  
  "hsc": {
    "board": "string",
    "institute_short": "string (max 35 chars)",
    "year": "string (e.g., '2019--21')",
    "grade_x": "string",
    "grade_y": "string (optional)"
  },
  
  "ug": {
    "university": "string",
    "institute_short": "string (max 35 chars)",
    "year_range": "string (e.g., '2021--24')",
    "grade_x": "string",
    "grade_y": "string"
  },
  
  "pg": {
    "year_range": "string (e.g., '2024--26')",
    "show_grade": "boolean",
    "grade_x": "string (if show_grade is true)",
    "grade_y": "string (if show_grade is true)"
  },
  
  "dissertation_selected": "boolean",
  
  "dissertation": {
    "title": "string",
    "guide_name": "string",
    "duration": "string (e.g., 'Aug'25–Present')",
    "current_work_lines": ["string (max 120 chars)", "..."],
    "future_work_lines": ["string (max 120 chars)", "..."]
  },
  
  "term_papers": [
    {
      "title": "string",
      "guided": "boolean",
      "guide_name": "string (if guided is true)",
      "duration": "string",
      "description_lines": ["string (max 120 chars)", "..."],
      "grade": "string (optional)"
    }
  ],
  
  "course_projects": [
    {
      "title": "string",
      "course_code": "string (format: AE-XXX)",
      "duration": "string",
      "one_line_description": "string (max 120 chars)"
    }
  ],
  
  "skills": {
    "econometrics": ["string", "..."],
    "ml": ["string", "..."],
    "business": ["string", "..."],
    "programming": ["string", "..."],
    "research": ["string", "..."]
  },
  
  "experience": [
    {
      "role": "string",
      "org": "string",
      "duration": "string",
      "bullets": ["string (max 120 chars)", "..."]
    }
  ],
  
  "awards": ["string (max 120 chars)", "..."]
}
```

### Validation Rules

| Field | Rule | Error |
|-------|------|-------|
| `first_name` | Required, max 40 chars | Missing or too long |
| `last_name` | Required, max 40 chars | Missing or too long |
| `email` | Required, valid email format | Invalid format |
| `institute_short` | Max 35 chars | Too long |
| `course_code` | Format: `AE-XXX` (3 digits) | Invalid format |
| `description_lines` | Each max 120 chars | Too long |
| `term_papers` | Max 2 entries | Too many |
| `experience.bullets` | Max 4 per entry | Too many |

### Special Characters

All text inputs are automatically escaped for LaTeX. The following characters are handled:
- `#` → `\#`
- `$` → `\$`
- `%` → `\%`
- `&` → `\&`
- `_` → `\_`
- `{` → `\{`
- `}` → `\}`
- `~` → `\textasciitilde{}`
- `^` → `\textasciicircum{}`
- `\` → `\textbackslash{}`

## Examples

### Example 1: Generate Resume

```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d @sample_data.json
```

### Example 2: Preview LaTeX Only

```bash
curl -X POST http://localhost:5000/api/preview-latex \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "program": "Applied Economics",
    "batch": "2024-26",
    ...
  }'
```

### Example 3: Download PDF

```bash
curl -O http://localhost:5000/api/download/john_doe.pdf
```

## Rate Limiting

Currently, there is no rate limiting. In production, consider implementing:
- Max 10 requests per minute per IP
- Max 100 resume generations per day per IP

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Error description",
  "details": "Additional details (optional)"
}
```

Common error scenarios:
- Invalid email format → 400 Bad Request
- Invalid course code → 400 Bad Request
- PDF compilation failed → 500 Internal Server Error
- File not found → 404 Not Found

## CORS

The backend allows CORS from all origins in development. In production, configure:

```python
CORS(app, resources={r"/api/*": {"origins": "https://your-domain.com"}})
```

## File Storage

Generated files are stored temporarily in the `output/` directory. Consider:
- Implementing automatic cleanup (files older than 24 hours)
- Using cloud storage (S3, etc.) for production
- Generating signed URLs for secure downloads

## Security Notes

1. **LaTeX Compilation:** Always runs with `-no-shell-escape` flag
2. **Input Sanitization:** All user input is escaped before LaTeX generation
3. **File Names:** Sanitized to prevent directory traversal
4. **Temp Directories:** Each compilation uses isolated temporary directory
5. **Validation:** All inputs validated before processing
