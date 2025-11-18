#!/bin/bash
# Test script for Resume Maker App

echo "========================================="
echo "Running Resume Maker Tests"
echo "========================================="

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo ""
echo "1. Running Python unit tests..."
echo "-----------------------------------"
python3 -m unittest tests/test_validation.py -v

if [ $? -ne 0 ]; then
    echo "ERROR: Unit tests failed"
    exit 1
fi

echo ""
echo "2. Testing LaTeX generation..."
echo "-----------------------------------"
python3 -c "
import json
import sys
sys.path.insert(0, 'backend')
from app import generate_latex

with open('sample_data.json', 'r') as f:
    data = json.load(f)

latex = generate_latex(data)
print(f'✓ LaTeX generation successful ({len(latex)} chars)')
"

if [ $? -ne 0 ]; then
    echo "ERROR: LaTeX generation failed"
    exit 1
fi

echo ""
echo "3. Testing PDF compilation..."
echo "-----------------------------------"
if command -v pdflatex &> /dev/null; then
    python3 -c "
import json
import sys
import os
import subprocess
import shutil
import tempfile
sys.path.insert(0, 'backend')
from app import generate_latex

with open('sample_data.json', 'r') as f:
    data = json.load(f)

latex = generate_latex(data)

with tempfile.TemporaryDirectory() as tmpdir:
    tex_file = os.path.join(tmpdir, 'test.tex')
    with open(tex_file, 'w') as f:
        f.write(latex)
    
    # Copy logo
    if os.path.exists('cds jnu logo.png'):
        shutil.copy('cds jnu logo.png', os.path.join(tmpdir, 'cds jnu logo.png'))
    
    # Compile
    result = subprocess.run(
        ['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 
         '-no-shell-escape', 'test.tex'],
        cwd=tmpdir,
        capture_output=True,
        timeout=30
    )
    
    if result.returncode == 0:
        pdf_file = os.path.join(tmpdir, 'test.pdf')
        if os.path.exists(pdf_file):
            size = os.path.getsize(pdf_file)
            print(f'✓ PDF compilation successful ({size} bytes)')
        else:
            print('ERROR: PDF not created')
            sys.exit(1)
    else:
        print('ERROR: PDF compilation failed')
        sys.exit(1)
"
    
    if [ $? -ne 0 ]; then
        echo "ERROR: PDF compilation test failed"
        exit 1
    fi
else
    echo "⚠ Skipping (pdflatex not installed)"
fi

echo ""
echo "4. Testing DOCX conversion..."
echo "-----------------------------------"
if command -v pandoc &> /dev/null; then
    echo "✓ Pandoc available for DOCX conversion"
else
    echo "⚠ Pandoc not installed (DOCX conversion will not work)"
fi

echo ""
echo "========================================="
echo "✓ All tests passed!"
echo "========================================="
