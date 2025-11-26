/**
 * Test script to generate a PDF resume using the LaTeX API
 * This demonstrates the serverless PDF generation capability
 * 
 * Requirements: Node.js 18+ (for built-in fetch support)
 * Usage: node test_pdf_generation.js
 */

const fs = require('fs');
const path = require('path');

// LaTeX API endpoint
const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';

// Read the logo and convert to base64
const logoPath = path.join(__dirname, '..', 'cds jnu logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

// Read sample data
const sampleDataPath = path.join(__dirname, '..', 'sample_data.json');
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text) {
  if (text === null || text === undefined) return '';
  text = String(text);
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

function formatGrade(gradeX, gradeY) {
  if (gradeY && String(gradeY).trim()) {
    return `${gradeX}/${gradeY}`;
  }
  return String(gradeX);
}

function generateDissertationBlock(data) {
  const diss = data.dissertation || {};
  const title = escapeLatex(diss.title || '');
  const guide = escapeLatex(diss.guide_name || '');
  const duration = escapeLatex(diss.duration || '');
  const currentLines = diss.current_work_lines || [];
  const futureLines = diss.future_work_lines || [];
  
  let block = `\\item \\textbf{Dissertation Title: ${title}} \\\\
\\emph{(M.A. Dissertation | Guide: \\textbf{${guide}})} \\hfill \\emph{(${duration})}\\\\
\\textbf{Current Work:}\\\\[-0.4cm]
\\begin{itemize}[noitemsep,nolistsep]
`;
  for (const line of currentLines.slice(0, 2)) {
    if (line && line.trim()) block += `  \\item ${escapeLatex(line)}\n`;
  }
  block += `\\end{itemize}
\\textbf{Future Work:}\\\\[-0.4cm]
\\begin{itemize}[noitemsep,nolistsep]
`;
  for (const line of futureLines.slice(0, 2)) {
    if (line && line.trim()) block += `  \\item ${escapeLatex(line)}\n`;
  }
  block += '\\end{itemize}\n';
  return block;
}

function generateTermPapersBlock(data) {
  const papers = (data.term_papers || []).slice(0, 2);
  if (!papers.length) return '\\item \\textit{(No term papers listed)}\n';
  
  let block = '';
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
      if (line && line.trim()) block += `  \\item ${escapeLatex(line)}\n`;
    }
    block += '\\end{itemize}\n';
  }
  return block;
}

function generateCourseProjectsBlock(data) {
  const projects = data.course_projects || [];
  if (!projects.length) return '__EMPTY_COURSE_PROJECTS__';
  
  let block = '';
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

function generateExperienceBlock(data) {
  const experiences = data.experience || [];
  if (!experiences.length) return '';
  
  let block = '\\noindent \\resheading{\\textbf{WORK EXPERIENCE \\& INTERNSHIPS}}\\\\[-0.3cm]\n';
  block += '\\begin{itemize}[noitemsep,nolistsep]\n';
  
  for (const exp of experiences) {
    const role = escapeLatex(exp.role || '');
    const org = escapeLatex(exp.org || '');
    const duration = escapeLatex(exp.duration || '');
    
    block += `  \\item \\textbf{${role}} | \\textbf{\\emph{${org}}} \\hfill \\emph{(${duration})}\\\\[-0.4cm]\n`;
    block += '  \\begin{itemize}[noitemsep,nolistsep]\n';
    for (const bullet of (exp.bullets || []).slice(0, 4)) {
      if (bullet && bullet.trim()) block += `    \\item ${escapeLatex(bullet)}\n`;
    }
    block += '  \\end{itemize}\n';
  }
  block += '\\end{itemize}\n';
  return block;
}

function generateAwardsBlock(data) {
  const awards = data.awards || [];
  const validAwards = awards.filter(award => award && award.trim());
  if (!validAwards.length) {
    return '__EMPTY_AWARDS__';
  }
  let block = '';
  for (const award of validAwards) {
    block += `\\item \\textbf{${escapeLatex(award)}}\n`;
  }
  return block;
}

// Helper function for conditional course projects section
function getCourseProjectsSection(data) {
  const content = generateCourseProjectsBlock(data);
  if (content === '__EMPTY_COURSE_PROJECTS__') {
    return '';
  }
  return `\\noindent \\resheading{\\textbf{COURSE PROJECTS}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
${content}
\\end{itemize}`;
}

// Helper function for conditional awards section
function getAwardsSection(data) {
  const content = generateAwardsBlock(data);
  if (content === '__EMPTY_AWARDS__') {
    return '';
  }
  return `\\noindent \\resheading{\\textbf{AWARDS \\& ACHIEVEMENTS / EXTRA-CURRICULAR}}\\\\[-0.3cm]
\\begin{itemize}
${content}
\\end{itemize}`;
}

/**
 * Generate complete LaTeX document
 */
function generateLatex(data) {
  const firstName = escapeLatex(data.first_name || '');
  const lastName = escapeLatex(data.last_name || '');
  const fullName = `${firstName} ${lastName}`;
  
  const ssc = data.ssc || {};
  const hsc = data.hsc || {};
  const ug = data.ug || {};
  const pg = data.pg || {};
  const skills = data.skills || {};

  return `\\documentclass[a4paper,10pt]{article}
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
    \\end{minipage}\\hspace{1.5cm}
    \\begin{minipage}{0.50\\linewidth}
        \\setlength{\\tabcolsep}{0pt}
        \\def\\arraystretch{1.15}
        \\begin{tabular}{@{}l}
            \\textbf{\\Large{${fullName}}} \\\\
            \\textbf{${escapeLatex(data.program || 'Applied Economics')}} \\\\
            ${escapeLatex('Centre For Development Studies, JNU')} \\\\
        \\end{tabular}
    \\end{minipage}\\hfill
    \\begin{minipage}{0.25\\linewidth}
        \\raggedleft
        \\setlength{\\tabcolsep}{0pt}
        \\def\\arraystretch{1.15}
        \\begin{tabular}{@{}r@{}}
            ${escapeLatex(data.email || '')} \\\\
            \\textbf{M.A. (${escapeLatex(data.batch || '')})} \\\\
            ${escapeLatex(data.gender || '')} \\\\
        \\end{tabular}
    \\end{minipage}
\\end{table}

% ================= EDUCATION ===================
\\setlength{\\tabcolsep}{5pt}
\\begin{table}[h!]
\\centering
\\begin{tabularx}{\\textwidth}{l l X l l}
\\toprule
\\textbf{Examination}    & \\textbf{University}   & \\textbf{Institute}    & \\textbf{Year}     & \\textbf{CPI/\\%} \\\\
\\toprule
Post Graduation & ${escapeLatex('JNU, New Delhi')}    & ${escapeLatex('Centre for Development Studies')}    & ${escapeLatex(pg.year_range || '')}   & ${pg.show_grade ? formatGrade(escapeLatex(pg.grade_x || ''), escapeLatex(pg.grade_y || '')) : ''} \\\\
Graduation  & ${escapeLatex(ug.university || '')} & ${escapeLatex(ug.institute_short || '')}  & ${escapeLatex(ug.year_range || '')}   & ${formatGrade(escapeLatex(ug.grade_x || ''), escapeLatex(ug.grade_y || ''))} \\\\
Intermediate/+2     & ${escapeLatex(hsc.board || '')}   & ${escapeLatex(hsc.institute_short || '')} & ${escapeLatex(hsc.year || '')}       & ${formatGrade(escapeLatex(hsc.grade_x || ''), escapeLatex(hsc.grade_y || ''))}    \\\\
Matriculation   & ${escapeLatex(ssc.board || '')}   & ${escapeLatex(ssc.institute_short || '')}    & ${escapeLatex(ssc.year || '')}          & ${formatGrade(escapeLatex(ssc.grade_x || ''), escapeLatex(ssc.grade_y || ''))}   \\\\
\\bottomrule \\\\[-0.75cm]
\\end{tabularx}
\\end{table}

% ================= Dissertation/Term Paper ===================
\\noindent \\resheading{\\textbf{M.A. DISSERTATION \\& PROJECTS}}\\\\[-0.3cm]
\\begin{itemize}[noitemsep,nolistsep]
${data.dissertation_selected ? generateDissertationBlock(data) : generateTermPapersBlock(data)}
\\end{itemize}

% ================= COURSE PROJECTS ===================
${getCourseProjectsSection(data)}

% ================= SKILLS ===================
\\noindent \\resheading{\\textbf{TECHNICAL SKILLS}}\\\\[-0.4cm]
\\begin{itemize}
  \\item \\textbf{Econometrics \\& Data Analysis}: ${escapeLatex((skills.econometrics || []).join(', '))}\\\\[-0.5cm]
  \\item \\textbf{Statistical \\& ML Techniques}: ${escapeLatex((skills.ml || []).join(', '))}\\\\[-0.5cm]
  \\item \\textbf{Business \\& Data Analytics}: ${escapeLatex((skills.business || []).join(', '))}\\\\[-0.5cm]
  \\item \\textbf{Programming \\& Tools}: ${escapeLatex((skills.programming || []).join(', '))}\\\\[-0.5cm]
  \\item \\textbf{Research \\& Consulting Skills}: ${escapeLatex((skills.research || []).join(', '))}\\\\[-0.5cm]
\\end{itemize}

% ================= EXPERIENCE ===================
${generateExperienceBlock(data)}

% ================= Awards ===================
${getAwardsSection(data)}

\\end{document}
`;
}

/**
 * Compile LaTeX to PDF using external API
 */
async function compileLatexToPdf(latexContent) {
  const payload = {
    compiler: 'pdflatex',
    resources: [
      { main: true, content: latexContent },
      { path: 'cds jnu logo.png', file: logoBase64 }
    ]
  };

  console.log('Sending request to LaTeX API...');
  
  const response = await fetch(LATEX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/pdf')) {
      return { pdf: await response.arrayBuffer(), error: null };
    } else {
      const errorData = await response.json();
      return { pdf: null, error: errorData.error || 'Unknown error' };
    }
  } else {
    try {
      const errorData = await response.json();
      return { pdf: null, error: errorData.error || `Status ${response.status}` };
    } catch {
      return { pdf: null, error: `Status ${response.status}` };
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('PDF Resume Generation Test using LaTeX API');
  console.log('='.repeat(60));
  console.log();
  
  console.log('Sample data loaded:');
  console.log(`  Name: ${sampleData.first_name} ${sampleData.last_name}`);
  console.log(`  Email: ${sampleData.email}`);
  console.log(`  Program: ${sampleData.program}`);
  console.log(`  Batch: ${sampleData.batch}`);
  console.log();
  
  // Generate LaTeX
  console.log('Generating LaTeX document...');
  const latexContent = generateLatex(sampleData);
  
  // Save LaTeX file
  const latexPath = path.join(__dirname, '..', 'output', 'test_resume.tex');
  fs.mkdirSync(path.dirname(latexPath), { recursive: true });
  fs.writeFileSync(latexPath, latexContent);
  console.log(`LaTeX saved to: ${latexPath}`);
  console.log();
  
  // Compile to PDF
  console.log('Compiling to PDF using LaTeX API (latex.ytotech.com)...');
  const { pdf, error } = await compileLatexToPdf(latexContent);
  
  if (error) {
    console.error(`ERROR: PDF compilation failed: ${error}`);
    process.exit(1);
  }
  
  // Save PDF file
  const pdfPath = path.join(__dirname, '..', 'output', 'test_resume.pdf');
  fs.writeFileSync(pdfPath, Buffer.from(pdf));
  console.log(`PDF saved to: ${pdfPath}`);
  console.log();
  
  console.log('='.repeat(60));
  console.log('SUCCESS! PDF resume generated using serverless API method.');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
