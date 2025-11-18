from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import re
import subprocess
import shutil
import tempfile
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# LaTeX special character escaping
def escape_latex(text):
    """Escape special LaTeX characters"""
    if text is None:
        return ""
    
    text = str(text)
    # Escape special characters
    replacements = {
        '\\': r'\textbackslash{}',
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}'
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text

def validate_course_code(code):
    """Validate course code format AE-XXX"""
    return bool(re.match(r'^AE-\d{3}$', code))

def validate_email(email):
    """Basic email validation"""
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))

def format_grade(grade_x, grade_y):
    """Format grade as X/Y or just X if Y is empty"""
    # Note: Values should already be escaped before calling this function
    if grade_y and str(grade_y).strip():
        return f"{grade_x}/{grade_y}"
    return str(grade_x)

def sanitize_filename(name):
    """Create safe filename from name"""
    # Replace spaces and special chars with underscore
    safe_name = re.sub(r'[^\w\s-]', '', name)
    safe_name = re.sub(r'[-\s]+', '_', safe_name)
    return safe_name.lower()

def generate_dissertation_block(data):
    """Generate dissertation LaTeX block"""
    diss = data.get('dissertation', {})
    title = escape_latex(diss.get('title', ''))
    guide = escape_latex(diss.get('guide_name', ''))
    duration = escape_latex(diss.get('duration', ''))
    
    current_lines = diss.get('current_work_lines', [])
    future_lines = diss.get('future_work_lines', [])
    
    block = f"""\\item \\textbf{{Dissertation Title: {title}}} \\\\ 
\\emph{{(M.A. Dissertation | Guide: \\textbf{{{guide}}})}} \\hfill \\emph{{({duration})}}   
\\textbf{{Current Work:}}\\\\[-0.4cm]
\\begin{{itemize}}[noitemsep,nolistsep]
"""
    
    for line in current_lines[:2]:
        block += f"  \\item {escape_latex(line)}\n"
    
    block += """\\end{itemize}
\\textbf{Future Work:}\\\\[-0.4cm]
\\begin{itemize}[noitemsep,nolistsep]
"""
    
    for line in future_lines[:2]:
        block += f"  \\item {escape_latex(line)}\n"
    
    block += "\\end{itemize}\n"
    
    return block

def generate_term_papers_block(data):
    """Generate term papers LaTeX block"""
    papers = data.get('term_papers', [])[:2]  # Max 2
    block = ""
    
    if not papers:
        # Add placeholder if no term papers
        block = "\\item \\textit{(No term papers listed)}\n"
        return block
    
    for paper in papers:
        title = escape_latex(paper.get('title', ''))
        guided = paper.get('guided', False)
        guide = escape_latex(paper.get('guide_name', '')) if guided else ''
        duration = escape_latex(paper.get('duration', ''))
        grade = paper.get('grade', '')
        
        guide_text = f" | Guide: \\textbf{{{guide}}}" if guided else ""
        grade_text = f" | Grade: {escape_latex(grade)}" if grade else ""
        
        block += f"\\item \\textbf{{{title}}} \\\\\n"
        block += f"\\emph{{(Term Paper{guide_text}{grade_text})}} \\hfill \\emph{{({duration})}}\\\\\n"
        block += "\\begin{itemize}[noitemsep,nolistsep]\n"
        
        for line in paper.get('description_lines', []):
            if line.strip():  # Only add non-empty lines
                block += f"  \\item {escape_latex(line)}\n"
        
        block += "\\end{itemize}\n"
    
    return block

def generate_course_projects_block(data):
    """Generate course projects LaTeX block"""
    projects = data.get('course_projects', [])
    block = ""
    
    if not projects:
        # Add placeholder if no course projects
        block = "\\item \\textit{(No course projects listed)}\n"
        return block
    
    for project in projects:
        title = escape_latex(project.get('title', ''))
        code = escape_latex(project.get('course_code', ''))
        duration = escape_latex(project.get('duration', ''))
        desc = escape_latex(project.get('one_line_description', ''))
        
        block += f"\\item \\textbf{{{title}}}, \\emph{{({code})}} \\hfill \\emph{{({duration})}}\n"
        block += "\\begin{itemize}[noitemsep,nolistsep]\n"
        block += f"  \\item {desc}\n"
        block += "\\end{itemize}\n"
    
    return block

def generate_experience_block(data):
    """Generate work experience LaTeX block"""
    experiences = data.get('experience', [])
    
    if not experiences:
        return ""
    
    block = "\\noindent \\resheading{\\textbf{WORK EXPERIENCE \\& INTERNSHIPS}}\\\\[-0.3cm]\n"
    block += "\\begin{itemize}[noitemsep,nolistsep]\n"
    
    for exp in experiences:
        role = escape_latex(exp.get('role', ''))
        org = escape_latex(exp.get('org', ''))
        duration = escape_latex(exp.get('duration', ''))
        
        block += f"  \\item \\textbf{{{role}}} | \\textbf{{\\emph{{{org}}}}} \\hfill \\emph{{({duration})}}\\\\[-0.4cm]\n"
        block += "  \\begin{itemize}[noitemsep,nolistsep]\n"
        
        for bullet in exp.get('bullets', [])[:4]:  # Max 4 bullets
            block += f"    \\item {escape_latex(bullet)}\n"
        
        block += "  \\end{itemize}\n"
    
    block += "\\end{itemize}\n"
    
    return block

def generate_awards_block(data):
    """Generate awards LaTeX block"""
    awards = data.get('awards', [])
    block = ""
    
    if not awards:
        block = "\\item \\textit{(Add achievements here --- teaching, presentations, or conferences are valid.)}\n"
    else:
        for award in awards:
            block += f"\\item \\textbf{{{escape_latex(award)}}}\n"
    
    return block

def generate_latex(data):
    """Generate complete LaTeX document from data"""
    # Read template
    template_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                 'templates', 'resume_template.tex')
    with open(template_path, 'r') as f:
        template = f.read()
    
    # Header information
    first_name = escape_latex(data.get('first_name', ''))
    last_name = escape_latex(data.get('last_name', ''))
    full_name = f"{first_name} {last_name}".title()
    
    replacements = {
        '{{FIRSTNAME_LASTNAME}}': full_name,
        '{{EMAIL}}': escape_latex(data.get('email', '')),
        '{{PROGRAM}}': escape_latex(data.get('program', 'Applied Economics')),
        '{{BATCH}}': escape_latex(data.get('batch', '')),
        '{{GENDER}}': escape_latex(data.get('gender', '')),
        '{{UNIVERSITY_INSTITUTE_LINE1}}': escape_latex('Centre For Development Studies, JNU'),
    }
    
    # Education - SSC
    ssc = data.get('ssc', {})
    replacements['{{SSC_BOARD}}'] = escape_latex(ssc.get('board', ''))
    replacements['{{SSC_INSTITUTE}}'] = escape_latex(ssc.get('institute_short', ''))
    replacements['{{SSC_YEAR}}'] = escape_latex(ssc.get('year', ''))
    replacements['{{SSC_GRADE}}'] = format_grade(escape_latex(ssc.get('grade_x', '')), escape_latex(ssc.get('grade_y', '')))
    
    # Education - HSC
    hsc = data.get('hsc', {})
    replacements['{{HSC_BOARD}}'] = escape_latex(hsc.get('board', ''))
    replacements['{{HSC_INSTITUTE}}'] = escape_latex(hsc.get('institute_short', ''))
    replacements['{{HSC_YEAR}}'] = escape_latex(hsc.get('year', ''))
    replacements['{{HSC_GRADE}}'] = format_grade(escape_latex(hsc.get('grade_x', '')), escape_latex(hsc.get('grade_y', '')))
    
    # Education - UG
    ug = data.get('ug', {})
    replacements['{{UG_UNIVERSITY}}'] = escape_latex(ug.get('university', ''))
    replacements['{{UG_INSTITUTE}}'] = escape_latex(ug.get('institute_short', ''))
    replacements['{{UG_YEAR}}'] = escape_latex(ug.get('year_range', ''))
    replacements['{{UG_GRADE}}'] = format_grade(escape_latex(ug.get('grade_x', '')), escape_latex(ug.get('grade_y', '')))
    
    # Education - PG
    pg = data.get('pg', {})
    replacements['{{PG_UNIVERSITY}}'] = escape_latex('JNU, New Delhi')
    replacements['{{PG_INSTITUTE}}'] = escape_latex('Centre for Development Studies')
    replacements['{{PG_YEAR}}'] = escape_latex(pg.get('year_range', ''))
    
    if pg.get('show_grade', False):
        replacements['{{PG_GRADE}}'] = format_grade(escape_latex(pg.get('grade_x', '')), escape_latex(pg.get('grade_y', '')))
    else:
        replacements['{{PG_GRADE}}'] = ''
    
    # Dissertation or Term Papers
    if data.get('dissertation_selected', False):
        replacements['{{DISSERTATION_OR_TERMPAPER_BLOCK}}'] = generate_dissertation_block(data)
    else:
        replacements['{{DISSERTATION_OR_TERMPAPER_BLOCK}}'] = generate_term_papers_block(data)
    
    # Course Projects
    replacements['{{COURSE_PROJECTS_BLOCK}}'] = generate_course_projects_block(data)
    
    # Skills
    skills = data.get('skills', {})
    replacements['{{SKILLS_ECONOMETRICS}}'] = escape_latex(', '.join(skills.get('econometrics', [])))
    replacements['{{SKILLS_ML}}'] = escape_latex(', '.join(skills.get('ml', [])))
    replacements['{{SKILLS_BUSINESS}}'] = escape_latex(', '.join(skills.get('business', [])))
    replacements['{{SKILLS_PROGRAMMING}}'] = escape_latex(', '.join(skills.get('programming', [])))
    replacements['{{SKILLS_RESEARCH}}'] = escape_latex(', '.join(skills.get('research', [])))
    
    # Experience
    replacements['{{WORK_EXPERIENCE_BLOCK}}'] = generate_experience_block(data)
    
    # Awards
    replacements['{{AWARDS_BLOCK}}'] = generate_awards_block(data)
    
    # Replace all placeholders
    for placeholder, value in replacements.items():
        template = template.replace(placeholder, value)
    
    return template

@app.route('/api/generate', methods=['POST'])
def generate_resume():
    """Generate resume files from JSON data"""
    try:
        data = request.get_json()
        
        # Basic validation
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate email
        if not validate_email(data.get('email')):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate course codes
        for project in data.get('course_projects', []):
            code = project.get('course_code', '')
            if not validate_course_code(code):
                return jsonify({'error': f'Invalid course code: {code}. Must be AE-XXX format'}), 400
        
        # Generate LaTeX
        latex_content = generate_latex(data)
        
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create filename
            first_name = sanitize_filename(data.get('first_name', ''))
            last_name = sanitize_filename(data.get('last_name', ''))
            base_filename = f"{first_name}_{last_name}"
            
            # Write LaTeX file
            tex_path = os.path.join(tmpdir, f"{base_filename}.tex")
            with open(tex_path, 'w', encoding='utf-8') as f:
                f.write(latex_content)
            
            # Copy logo to temp directory
            logo_src = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cds jnu logo.png')
            logo_dst = os.path.join(tmpdir, 'cds jnu logo.png')
            if os.path.exists(logo_src):
                shutil.copy(logo_src, logo_dst)
            
            # Compile PDF with pdflatex (run twice for references)
            try:
                for _ in range(2):
                    result = subprocess.run(
                        ['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 
                         '-no-shell-escape', f"{base_filename}.tex"],
                        cwd=tmpdir,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                
                pdf_path = os.path.join(tmpdir, f"{base_filename}.pdf")
                if not os.path.exists(pdf_path):
                    return jsonify({
                        'error': 'PDF compilation failed',
                        'details': result.stderr
                    }), 500
                
            except subprocess.TimeoutExpired:
                return jsonify({'error': 'PDF compilation timed out'}), 500
            except FileNotFoundError:
                return jsonify({'error': 'pdflatex not found. Please install TeX Live'}), 500
            
            # Convert to DOCX with pandoc
            docx_path = os.path.join(tmpdir, f"{base_filename}.docx")
            try:
                subprocess.run(
                    ['pandoc', tex_path, '-o', docx_path, '--from=latex', '--to=docx'],
                    cwd=tmpdir,
                    capture_output=True,
                    timeout=30,
                    check=True
                )
            except subprocess.TimeoutExpired:
                return jsonify({'error': 'DOCX conversion timed out'}), 500
            except FileNotFoundError:
                return jsonify({'error': 'pandoc not found. Please install pandoc'}), 500
            except subprocess.CalledProcessError as e:
                # DOCX conversion is best effort
                print(f"DOCX conversion warning: {e.stderr}")
            
            # Read generated files
            with open(tex_path, 'r', encoding='utf-8') as f:
                tex_content = f.read()
            
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()
            
            docx_content = None
            if os.path.exists(docx_path):
                with open(docx_path, 'rb') as f:
                    docx_content = f.read()
            
            # Save files temporarily for download
            output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
            os.makedirs(output_dir, exist_ok=True)
            
            output_tex = os.path.join(output_dir, f"{base_filename}.tex")
            output_pdf = os.path.join(output_dir, f"{base_filename}.pdf")
            output_docx = os.path.join(output_dir, f"{base_filename}.docx")
            
            with open(output_tex, 'w', encoding='utf-8') as f:
                f.write(tex_content)
            
            with open(output_pdf, 'wb') as f:
                f.write(pdf_content)
            
            if docx_content:
                with open(output_docx, 'wb') as f:
                    f.write(docx_content)
            
            return jsonify({
                'success': True,
                'message': 'Resume generated successfully',
                'files': {
                    'tex': f"/api/download/{base_filename}.tex",
                    'pdf': f"/api/download/{base_filename}.pdf",
                    'docx': f"/api/download/{base_filename}.docx" if docx_content else None
                },
                'latex_preview': tex_content
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download generated file"""
    try:
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
        file_path = os.path.join(output_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview-latex', methods=['POST'])
def preview_latex():
    """Generate LaTeX preview without compilation"""
    try:
        data = request.get_json()
        latex_content = generate_latex(data)
        return jsonify({
            'success': True,
            'latex': latex_content
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
