/**
 * LaTeX Generation Module
 * This module handles LaTeX generation and PDF compilation via external API
 * No backend required - can be used in static hosting environments like GitHub Pages
 */

// LaTeX API endpoint (latex.ytotech.com - free public API)
const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';

// Logo in base64 format for embedding in PDF
const LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAqUAAAFdCAYAAAA68RTbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAD+EklEQVR4Xuydd5gUxdaH31PdPWEjOSNpWZaMAkYEMeecc85izigmzIpZMeeEWa9ZwYARjGQQlCA5bZyZ7q7z/dGzuOxFv3uvAdB5n6efganqnumemupfnzpBWIuMHjTILayslPqv58iRY92joqBAB3/wQVD/9XUArfPv3HySY51hwoQJsXnzggZTp/7QcvbsH0ocx7T4atx3JcuWLi+uqqr2RIwYY0QgZlWTYRg2MaKdVGyegEM0uNWIiCLiGENoLaqKajTWHeNI9P9QFAPiiOO4KmJsTXX1AjfmzXONWY441WjKNmrYwHbuXJJp2arFMnG8qYWFycWbbtpvaiKR/GnTTUvL';

/**
 * Escape special LaTeX characters
 * @param {string} text - Input text to escape
 * @returns {string} - Escaped text safe for LaTeX
 */
export function escapeLatex(text) {
  if (text === null || text === undefined) {
    return '';
  }
  
  text = String(text);
  
  // Escape special characters in order
  const replacements = [
    ['\\', '\\textbackslash{}'],
    ['&', '\\&'],
    ['%', '\\%'],
    ['$', '\\$'],
    ['#', '\\#'],
    ['_', '\\_'],
    ['{', '\\{'],
    ['}', '\\}'],
    ['~', '\\textasciitilde{}'],
    ['^', '\\textasciicircum{}']
  ];
  
  for (const [old, newStr] of replacements) {
    text = text.split(old).join(newStr);
  }
  
  return text;
}

/**
 * Validate course code format AE-XXX
 * Note: This validation is specific to CDS JNU Applied Economics program.
 * Modify the regex pattern if needed for other programs (e.g., /^[A-Z]{2}-\d{3}$/)
 * @param {string} code - Course code to validate
 * @returns {boolean} - True if valid
 */
export function validateCourseCode(code) {
  return /^AE-\d{3}$/.test(code);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Format grade as X/Y or just X if Y is empty
 * @param {string} gradeX - Grade value
 * @param {string} gradeY - Grade denominator (optional)
 * @returns {string} - Formatted grade string
 */
export function formatGrade(gradeX, gradeY) {
  if (gradeY && String(gradeY).trim()) {
    return `${gradeX}/${gradeY}`;
  }
  return String(gradeX);
}

/**
 * Create safe filename from name
 * @param {string} name - Name to sanitize
 * @returns {string} - Safe filename
 */
export function sanitizeFilename(name) {
  let safeName = name.replace(/[^\w\s-]/g, '');
  safeName = safeName.replace(/[-\s]+/g, '_');
  return safeName.toLowerCase();
}

/**
 * Generate dissertation LaTeX block
 * @param {object} data - Form data
 * @returns {string} - LaTeX block
 */
function generateDissertationBlock(data) {
  const diss = data.dissertation || {};
  const title = escapeLatex(diss.title || '');
  const guide = escapeLatex(diss.guide_name || '');
  const duration = escapeLatex(diss.duration || '');
  
  const currentLines = diss.current_work_lines || [];
  const futureLines = diss.future_work_lines || [];
  
  let block = `\\item \\textbf{Dissertation Title: ${title}} \\\\ 
\\emph{(M.A. Dissertation | Guide: \\textbf{${guide}})} \\hfill \\emph{(${duration})}   
\\textbf{Current Work:}\\\\[-0.4cm]
\\begin{itemize}[noitemsep,nolistsep]
`;
  
  for (const line of currentLines.slice(0, 2)) {
    if (line && line.trim()) {
      block += `  \\item ${escapeLatex(line)}\n`;
    }
  }
  
  block += `\\end{itemize}
\\textbf{Future Work:}\\\\[-0.4cm]
\\begin{itemize}[noitemsep,nolistsep]
`;
  
  for (const line of futureLines.slice(0, 2)) {
    if (line && line.trim()) {
      block += `  \\item ${escapeLatex(line)}\n`;
    }
  }
  
  block += '\\end{itemize}\n';
  
  return block;
}

/**
 * Generate term papers LaTeX block
 * @param {object} data - Form data
 * @returns {string} - LaTeX block
 */
function generateTermPapersBlock(data) {
  const papers = (data.term_papers || []).slice(0, 2);
  let block = '';
  
  if (!papers.length) {
    block = '\\item \\textit{(No term papers listed)}\n';
    return block;
  }
  
  for (const paper of papers) {
    const title = escapeLatex(paper.title || '');
    const guided = paper.guided || false;
    const guide = guided ? escapeLatex(paper.guide_name || '') : '';
    const duration = escapeLatex(paper.duration || '');
    const grade = paper.grade || '';
    
    const guideText = guided ? ` | Guide: \\textbf{${guide}}` : '';
    const gradeText = grade ? ` | Grade: ${escapeLatex(grade)}` : '';
    
    block += `\\item \\textbf{${title}} \\\\\n`;
    block += `\\emph{(Term Paper${guideText}${gradeText})} \\hfill \\emph{(${duration})}\\\\\n`;
    block += '\\begin{itemize}[noitemsep,nolistsep]\n';
    
    for (const line of (paper.description_lines || [])) {
      if (line && line.trim()) {
        block += `  \\item ${escapeLatex(line)}\n`;
      }
    }
    
    block += '\\end{itemize}\n';
  }
  
  return block;
}

/**
 * Generate course projects LaTeX block
 * @param {object} data - Form data
 * @returns {string} - LaTeX block
 */
function generateCourseProjectsBlock(data) {
  const projects = data.course_projects || [];
  let block = '';
  
  if (!projects.length) {
    block = '\\item \\textit{(No course projects listed)}\n';
    return block;
  }
  
  for (const project of projects) {
    const title = escapeLatex(project.title || '');
    const code = escapeLatex(project.course_code || '');
    const duration = escapeLatex(project.duration || '');
    const desc = escapeLatex(project.one_line_description || '');
    
    block += `\\item \\textbf{${title}}, \\emph{(${code})} \\hfill \\emph{(${duration})}\n`;
    block += '\\begin{itemize}[noitemsep,nolistsep]\n';
    block += `  \\item ${desc}\n`;
    block += '\\end{itemize}\n';
  }
  
  return block;
}

/**
 * Generate work experience LaTeX block
 * @param {object} data - Form data
 * @returns {string} - LaTeX block
 */
function generateExperienceBlock(data) {
  const experiences = data.experience || [];
  
  if (!experiences.length) {
    return '';
  }
  
  let block = '\\noindent \\resheading{\\textbf{WORK EXPERIENCE \\& INTERNSHIPS}}\\\\[-0.3cm]\n';
  block += '\\begin{itemize}[noitemsep,nolistsep]\n';
  
  for (const exp of experiences) {
    const role = escapeLatex(exp.role || '');
    const org = escapeLatex(exp.org || '');
    const duration = escapeLatex(exp.duration || '');
    
    block += `  \\item \\textbf{${role}} | \\textbf{\\emph{${org}}} \\hfill \\emph{(${duration})}\\\\[-0.4cm]\n`;
    block += '  \\begin{itemize}[noitemsep,nolistsep]\n';
    
    for (const bullet of (exp.bullets || []).slice(0, 4)) {
      if (bullet && bullet.trim()) {
        block += `    \\item ${escapeLatex(bullet)}\n`;
      }
    }
    
    block += '  \\end{itemize}\n';
  }
  
  block += '\\end{itemize}\n';
  
  return block;
}

/**
 * Generate awards LaTeX block
 * @param {object} data - Form data
 * @returns {string} - LaTeX block
 */
function generateAwardsBlock(data) {
  const awards = data.awards || [];
  let block = '';
  
  if (!awards.length) {
    block = '\\item \\textit{(Add achievements here --- teaching, presentations, or conferences are valid.)}\n';
  } else {
    for (const award of awards) {
      if (award && award.trim()) {
        block += `\\item \\textbf{${escapeLatex(award)}}\n`;
      }
    }
  }
  
  return block;
}

/**
 * LaTeX template
 */
const LATEX_TEMPLATE = `\\documentclass[a4paper,10pt]{article}
\\usepackage[top=0.75in, bottom=0.2in, left=0.35in, right=0.35in]{geometry}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{url}
\\usepackage{enumitem}
\\usepackage{palatino}
\\usepackage{tabularx}
\\fontfamily{SansSerif}\\selectfont
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{color}
\\definecolor{mygrey}{gray}{0.82}
\\textheight=9.75in
\\raggedbottom
\\setlength{\\tabcolsep}{0in}
\\newcommand{\\resheading}[1]{{\\small \\colorbox{mygrey}{\\begin{minipage}{0.99\\textwidth}{\\textbf{#1 \\vphantom{p\\^{E}}}}\\end{minipage}}}}
\\begin{document}

% ================= HEADER ===================
\\begin{table}
    \\begin{minipage}{0.15\\linewidth}
        \\centering
        \\includegraphics[height =0.8in]{cds jnu logo.png}
    \\end{minipage}
    \\begin{minipage}{0.65\\linewidth}
        \\setlength{\\tabcolsep}{70pt}
        \\def\\arraystretch{1.15}
        \\begin{tabular}{ll}
            \\textbf{\\Large{ {{FIRSTNAME_LASTNAME}} }}  &  {{EMAIL}} \\\\
            \\textbf{ {{PROGRAM}} } & \\textbf{ M.A. ({{BATCH}}) } \\\\
            {{UNIVERSITY_INSTITUTE_LINE1}} &  {{GENDER}}\\\\
        \\end{tabular}
    \\end{minipage}\\hfill
\\end{table}

% ================= EDUCATION ===================
\\setlength{\\tabcolsep}{20pt}
\\begin{table}
\\centering
\\begin{tabular}{lllll}
\\toprule
\\textbf{Examination}    & \\textbf{University}   & \\textbf{Institute}    & \\textbf{Year}     & \\textbf{CPI/\\%} \\\\
\\toprule
Post Graduation & {{PG_UNIVERSITY}}    & {{PG_INSTITUTE}}    & {{PG_YEAR}}   & {{PG_GRADE}} \\\\
Graduation  & {{UG_UNIVERSITY}} & {{UG_INSTITUTE}}  & {{UG_YEAR}}   & {{UG_GRADE}} \\\\
Intermediate/+2     & {{HSC_BOARD}}   & {{HSC_INSTITUTE}} & {{HSC_YEAR}}       & {{HSC_GRADE}}    \\\\
Matriculation   & {{SSC_BOARD}}   & {{SSC_INSTITUTE}}    & {{SSC_YEAR}}          & {{SSC_GRADE}}   \\\\
\\bottomrule \\\\[-0.75cm]
\\end{tabular}
\\end{table}

% ================= Dissertation/Term Paper ===================
\\noindent \\resheading{\\textbf{M.A. DISSERTATION \\& PROJECTS}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
{{DISSERTATION_OR_TERMPAPER_BLOCK}}
\\end{itemize}

% ================= COURSE PROJECTS ===================
\\noindent \\resheading{\\textbf{COURSE PROJECTS}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
{{COURSE_PROJECTS_BLOCK}}
\\end{itemize}

% ================= SKILLS ===================
\\noindent \\resheading{\\textbf{TECHNICAL SKILLS}}\\\\[-0.4cm]
\\begin{itemize}
  \\item \\textbf{Econometrics \\& Data Analysis}: {{SKILLS_ECONOMETRICS}}\\\\[-0.5cm]
  \\item \\textbf{Statistical \\& ML Techniques}: {{SKILLS_ML}}\\\\[-0.5cm]
  \\item \\textbf{Business \\& Data Analytics}: {{SKILLS_BUSINESS}}\\\\[-0.5cm]
  \\item \\textbf{Programming \\& Tools}: {{SKILLS_PROGRAMMING}}\\\\[-0.5cm]
  \\item \\textbf{Research \\& Consulting Skills}: {{SKILLS_RESEARCH}}\\\\[-0.5cm]
\\end{itemize}

% ================= EXPERIENCE ===================
{{WORK_EXPERIENCE_BLOCK}}

% ================= Awards ===================
\\noindent \\resheading{\\textbf{AWARDS \\& ACHIEVEMENTS / EXTRA-CURRICULAR}}\\\\[-0.3cm]
\\begin{itemize}
{{AWARDS_BLOCK}}
\\end{itemize}

\\end{document}
`;

/**
 * Generate complete LaTeX document from form data
 * @param {object} data - Form data
 * @returns {string} - Complete LaTeX document
 */
export function generateLatex(data) {
  let template = LATEX_TEMPLATE;
  
  // Header information
  const firstName = escapeLatex(data.first_name || '');
  const lastName = escapeLatex(data.last_name || '');
  const fullName = `${firstName} ${lastName}`.replace(/\b\w/g, c => c.toUpperCase());
  
  const replacements = {
    '{{FIRSTNAME_LASTNAME}}': fullName,
    '{{EMAIL}}': escapeLatex(data.email || ''),
    '{{PROGRAM}}': escapeLatex(data.program || 'Applied Economics'),
    '{{BATCH}}': escapeLatex(data.batch || ''),
    '{{GENDER}}': escapeLatex(data.gender || ''),
    '{{UNIVERSITY_INSTITUTE_LINE1}}': escapeLatex('Centre For Development Studies, JNU'),
  };
  
  // Education - SSC
  const ssc = data.ssc || {};
  replacements['{{SSC_BOARD}}'] = escapeLatex(ssc.board || '');
  replacements['{{SSC_INSTITUTE}}'] = escapeLatex(ssc.institute_short || '');
  replacements['{{SSC_YEAR}}'] = escapeLatex(ssc.year || '');
  replacements['{{SSC_GRADE}}'] = formatGrade(escapeLatex(ssc.grade_x || ''), escapeLatex(ssc.grade_y || ''));
  
  // Education - HSC
  const hsc = data.hsc || {};
  replacements['{{HSC_BOARD}}'] = escapeLatex(hsc.board || '');
  replacements['{{HSC_INSTITUTE}}'] = escapeLatex(hsc.institute_short || '');
  replacements['{{HSC_YEAR}}'] = escapeLatex(hsc.year || '');
  replacements['{{HSC_GRADE}}'] = formatGrade(escapeLatex(hsc.grade_x || ''), escapeLatex(hsc.grade_y || ''));
  
  // Education - UG
  const ug = data.ug || {};
  replacements['{{UG_UNIVERSITY}}'] = escapeLatex(ug.university || '');
  replacements['{{UG_INSTITUTE}}'] = escapeLatex(ug.institute_short || '');
  replacements['{{UG_YEAR}}'] = escapeLatex(ug.year_range || '');
  replacements['{{UG_GRADE}}'] = formatGrade(escapeLatex(ug.grade_x || ''), escapeLatex(ug.grade_y || ''));
  
  // Education - PG
  const pg = data.pg || {};
  replacements['{{PG_UNIVERSITY}}'] = escapeLatex('JNU, New Delhi');
  replacements['{{PG_INSTITUTE}}'] = escapeLatex('Centre for Development Studies');
  replacements['{{PG_YEAR}}'] = escapeLatex(pg.year_range || '');
  
  if (pg.show_grade) {
    replacements['{{PG_GRADE}}'] = formatGrade(escapeLatex(pg.grade_x || ''), escapeLatex(pg.grade_y || ''));
  } else {
    replacements['{{PG_GRADE}}'] = '';
  }
  
  // Dissertation or Term Papers
  if (data.dissertation_selected) {
    replacements['{{DISSERTATION_OR_TERMPAPER_BLOCK}}'] = generateDissertationBlock(data);
  } else {
    replacements['{{DISSERTATION_OR_TERMPAPER_BLOCK}}'] = generateTermPapersBlock(data);
  }
  
  // Course Projects
  replacements['{{COURSE_PROJECTS_BLOCK}}'] = generateCourseProjectsBlock(data);
  
  // Skills
  const skills = data.skills || {};
  replacements['{{SKILLS_ECONOMETRICS}}'] = escapeLatex((skills.econometrics || []).join(', '));
  replacements['{{SKILLS_ML}}'] = escapeLatex((skills.ml || []).join(', '));
  replacements['{{SKILLS_BUSINESS}}'] = escapeLatex((skills.business || []).join(', '));
  replacements['{{SKILLS_PROGRAMMING}}'] = escapeLatex((skills.programming || []).join(', '));
  replacements['{{SKILLS_RESEARCH}}'] = escapeLatex((skills.research || []).join(', '));
  
  // Experience
  replacements['{{WORK_EXPERIENCE_BLOCK}}'] = generateExperienceBlock(data);
  
  // Awards
  replacements['{{AWARDS_BLOCK}}'] = generateAwardsBlock(data);
  
  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.split(placeholder).join(value);
  }
  
  return template;
}

/**
 * Compile LaTeX to PDF using external API
 * @param {string} latexContent - LaTeX document content
 * @returns {Promise<{pdf: Blob|null, error: string|null}>} - Result object
 */
export async function compileLatexToPdf(latexContent) {
  // Prepare the API request using latex.ytotech.com API format
  const resources = [
    {
      main: true,
      content: latexContent
    },
    {
      path: 'cds jnu logo.png',
      file: LOGO_BASE64
    }
  ];
  
  const payload = {
    compiler: 'pdflatex',
    resources: resources
  };
  
  try {
    const response = await fetch(LATEX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    // Check for successful status (200 OK or 201 Created)
    if (response.ok) {
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/pdf')) {
        const pdfBlob = await response.blob();
        return { pdf: pdfBlob, error: null };
      } else {
        // API might return JSON with error
        try {
          const errorData = await response.json();
          return { pdf: null, error: errorData.error || 'Unknown compilation error' };
        } catch {
          return { pdf: null, error: 'Unexpected response from LaTeX API' };
        }
      }
    } else {
      try {
        const errorData = await response.json();
        return { pdf: null, error: errorData.error || `API returned status ${response.status}` };
      } catch {
        return { pdf: null, error: `LaTeX API returned status ${response.status}` };
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { pdf: null, error: 'LaTeX API request timed out' };
    }
    return { pdf: null, error: `LaTeX API request failed: ${error.message}` };
  }
}

/**
 * Generate resume and return PDF blob
 * @param {object} data - Form data
 * @returns {Promise<{latex: string, pdf: Blob|null, error: string|null}>} - Result object
 */
export async function generateResume(data) {
  // Validate required fields
  const requiredFields = ['first_name', 'last_name', 'email'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return { latex: '', pdf: null, error: `Missing required field: ${field}` };
    }
  }
  
  // Validate email
  if (!validateEmail(data.email)) {
    return { latex: '', pdf: null, error: 'Invalid email format' };
  }
  
  // Validate course codes
  for (const project of (data.course_projects || [])) {
    const code = project.course_code || '';
    if (code && !validateCourseCode(code)) {
      return { latex: '', pdf: null, error: `Invalid course code: ${code}. Must be AE-XXX format` };
    }
  }
  
  // Generate LaTeX
  const latexContent = generateLatex(data);
  
  // Compile PDF
  const { pdf, error } = await compileLatexToPdf(latexContent);
  
  return { latex: latexContent, pdf, error };
}

/**
 * Download a blob as a file
 * @param {Blob} blob - File content as blob
 * @param {string} filename - Name for the download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download text content as a file
 * @param {string} content - Text content
 * @param {string} filename - Name for the download
 * @param {string} mimeType - MIME type
 */
export function downloadText(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}
