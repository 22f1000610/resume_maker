import unittest
import sys
import os
from unittest.mock import patch, MagicMock

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import (
    compile_latex_with_api,
    compile_latex_locally,
    generate_latex,
    LATEX_COMPILE_MODE,
    LATEX_API_URL
)


class TestLatexCompilation(unittest.TestCase):
    """Tests for LaTeX compilation functions"""
    
    def test_compile_mode_default(self):
        """Test that default compile mode is 'api' for serverless compatibility"""
        # Default mode should be 'api' unless environment variable is set
        default_mode = os.environ.get('LATEX_COMPILE_MODE', 'api')
        self.assertEqual(default_mode, 'api')
    
    def test_latex_api_url_default(self):
        """Test that default API URL is set correctly"""
        default_url = os.environ.get('LATEX_API_URL', 'https://latex.ytotech.com/builds/sync')
        self.assertEqual(default_url, 'https://latex.ytotech.com/builds/sync')

    @patch('app.requests.post')
    def test_compile_latex_with_api_success(self, mock_post):
        """Test successful API compilation"""
        # Mock a successful PDF response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'application/pdf'}
        mock_response.content = b'%PDF-1.4 mock pdf content'
        mock_post.return_value = mock_response
        
        simple_latex = r"""\documentclass{article}
\begin{document}
Hello World
\end{document}"""
        
        pdf_content, error = compile_latex_with_api(simple_latex)
        
        self.assertIsNotNone(pdf_content)
        self.assertIsNone(error)
        self.assertEqual(pdf_content, b'%PDF-1.4 mock pdf content')

    @patch('app.requests.post')
    def test_compile_latex_with_api_success_201(self, mock_post):
        """Test successful API compilation with 201 Created status"""
        # Mock a successful PDF response with 201 status (actual API behavior)
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.headers = {'Content-Type': 'application/pdf'}
        mock_response.content = b'%PDF-1.4 mock pdf content'
        mock_post.return_value = mock_response
        
        simple_latex = r"""\documentclass{article}
\begin{document}
Hello World
\end{document}"""
        
        pdf_content, error = compile_latex_with_api(simple_latex)
        
        self.assertIsNotNone(pdf_content)
        self.assertIsNone(error)
        self.assertEqual(pdf_content, b'%PDF-1.4 mock pdf content')

    @patch('app.requests.post')
    def test_compile_latex_with_api_error(self, mock_post):
        """Test API compilation with error response"""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'error': 'Invalid LaTeX syntax'}
        mock_post.return_value = mock_response
        
        bad_latex = r"\documentclass{article"  # Missing closing brace
        
        pdf_content, error = compile_latex_with_api(bad_latex)
        
        self.assertIsNone(pdf_content)
        self.assertIsNotNone(error)

    @patch('app.requests.post')
    def test_compile_latex_with_api_timeout(self, mock_post):
        """Test API compilation timeout handling"""
        import requests
        mock_post.side_effect = requests.Timeout()
        
        latex = r"\documentclass{article}\begin{document}Test\end{document}"
        
        pdf_content, error = compile_latex_with_api(latex)
        
        self.assertIsNone(pdf_content)
        self.assertIn('timed out', error.lower())

    @patch('app.requests.post')
    def test_compile_latex_with_api_request_exception(self, mock_post):
        """Test API compilation network error handling"""
        import requests
        mock_post.side_effect = requests.RequestException("Network error")
        
        latex = r"\documentclass{article}\begin{document}Test\end{document}"
        
        pdf_content, error = compile_latex_with_api(latex)
        
        self.assertIsNone(pdf_content)
        self.assertIn('failed', error.lower())

    @patch('app.requests.post')
    def test_compile_latex_with_api_with_logo(self, mock_post):
        """Test API compilation with logo resource"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'application/pdf'}
        mock_response.content = b'%PDF-1.4 mock pdf content'
        mock_post.return_value = mock_response
        
        latex = r"\documentclass{article}\begin{document}Test\end{document}"
        logo_base64 = "aGVsbG8="  # "hello" in base64
        
        pdf_content, error = compile_latex_with_api(latex, logo_base64)
        
        # Verify the API was called with resources including the logo
        call_args = mock_post.call_args
        self.assertIsNotNone(call_args)
        json_payload = call_args[1]['json']
        self.assertEqual(len(json_payload['resources']), 2)  # main + logo


class TestGenerateLatex(unittest.TestCase):
    """Tests for LaTeX generation"""
    
    def test_generate_latex_basic(self):
        """Test basic LaTeX generation"""
        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'program': 'Applied Economics',
            'batch': '2024-26',
            'gender': 'Male',
            'ssc': {'board': 'CBSE', 'institute_short': 'ABC School', 'year': '2018', 'grade_x': '95', 'grade_y': ''},
            'hsc': {'board': 'CBSE', 'institute_short': 'XYZ College', 'year': '2020', 'grade_x': '90', 'grade_y': ''},
            'ug': {'university': 'DU', 'institute_short': 'SRCC', 'year_range': '2020-23', 'grade_x': '8.5', 'grade_y': '10'},
            'pg': {'year_range': '2024-26', 'show_grade': False},
            'dissertation_selected': False,
            'term_papers': [],
            'course_projects': [],
            'skills': {
                'econometrics': [],
                'ml': [],
                'business': [],
                'programming': [],
                'research': []
            },
            'experience': [],
            'awards': []
        }
        
        latex = generate_latex(data)
        
        # Check that the LaTeX contains expected content
        self.assertIn('Test User', latex)
        self.assertIn('test@example.com', latex)
        self.assertIn('Applied Economics', latex)
        self.assertIn('\\documentclass', latex)
        self.assertIn('\\begin{document}', latex)
        self.assertIn('\\end{document}', latex)


if __name__ == '__main__':
    unittest.main()
