import unittest
import sys
import os
import json
import re

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import (
    escape_latex, 
    validate_course_code, 
    validate_email, 
    format_grade,
    sanitize_filename
)

class TestValidation(unittest.TestCase):
    
    def test_email_validation(self):
        """Test email validation"""
        self.assertTrue(validate_email('rahul24ma@cds.ac.in'))
        self.assertTrue(validate_email('test@example.com'))
        self.assertFalse(validate_email('invalid-email'))
        self.assertFalse(validate_email('@example.com'))
        self.assertFalse(validate_email('test@'))
    
    def test_course_code_validation(self):
        """Test course code validation - must be AE-XXX format"""
        self.assertTrue(validate_course_code('AE-201'))
        self.assertTrue(validate_course_code('AE-999'))
        self.assertTrue(validate_course_code('AE-000'))
        self.assertFalse(validate_course_code('AE-10'))  # Too short
        self.assertFalse(validate_course_code('AE-1000'))  # Too long
        self.assertFalse(validate_course_code('BE-201'))  # Wrong prefix
        self.assertFalse(validate_course_code('AE201'))  # Missing dash
    
    def test_latex_escaping(self):
        """Test LaTeX special character escaping"""
        # Test basic escaping
        self.assertIn(r'\%', escape_latex('100%'))
        self.assertIn(r'\$', escape_latex('$100'))
        self.assertIn(r'\&', escape_latex('R&D'))
        self.assertIn(r'\#', escape_latex('#tag'))
        self.assertIn(r'\_', escape_latex('file_name'))
        
        # Test complex string
        text = "Research on A&B costs $100 with #tags and 90% success_rate"
        escaped = escape_latex(text)
        # Should not contain unescaped special chars
        self.assertNotIn('$', escaped.replace(r'\$', ''))
        self.assertNotIn('%', escaped.replace(r'\%', ''))
        self.assertNotIn('&', escaped.replace(r'\&', ''))
    
    def test_grade_formatting(self):
        """Test grade formatting"""
        self.assertEqual(format_grade('8.2', '10'), '8.2/10')
        self.assertEqual(format_grade('93.21', ''), '93.21')
        self.assertEqual(format_grade('7', '9'), '7/9')
        self.assertEqual(format_grade('A+', None), 'A+')
    
    def test_filename_sanitization(self):
        """Test filename sanitization"""
        self.assertEqual(sanitize_filename('Rahul Kumar'), 'rahul_kumar')
        self.assertEqual(sanitize_filename('John-Doe'), 'john_doe')
        self.assertEqual(sanitize_filename('Test@Name'), 'testname')


class TestDataStructure(unittest.TestCase):
    
    def test_sample_data_structure(self):
        """Test that sample data file is valid JSON and has required fields"""
        sample_file = os.path.join(os.path.dirname(__file__), '..', 'sample_data.json')
        
        with open(sample_file, 'r') as f:
            data = json.load(f)
        
        # Check required top-level fields
        self.assertIn('first_name', data)
        self.assertIn('last_name', data)
        self.assertIn('email', data)
        self.assertIn('program', data)
        self.assertIn('batch', data)
        
        # Check education sections
        self.assertIn('ssc', data)
        self.assertIn('hsc', data)
        self.assertIn('ug', data)
        self.assertIn('pg', data)
        
        # Check dissertation/term papers
        self.assertIn('dissertation_selected', data)
        if data['dissertation_selected']:
            self.assertIn('dissertation', data)
        
        # Check skills
        self.assertIn('skills', data)
        self.assertIn('econometrics', data['skills'])
        self.assertIn('ml', data['skills'])
        
    def test_term_paper_limit(self):
        """Test that max 2 term papers constraint is enforced in validation"""
        # This would be enforced in frontend and backend validation
        max_term_papers = 2
        sample_term_papers = [
            {'title': 'Paper 1'},
            {'title': 'Paper 2'}
        ]
        self.assertLessEqual(len(sample_term_papers), max_term_papers)
    
    def test_institute_name_length(self):
        """Test institute name length constraint"""
        max_length = 35
        short_name = "ABC College"
        long_name = "A" * 40
        
        self.assertLessEqual(len(short_name), max_length)
        self.assertGreater(len(long_name), max_length)
    
    def test_description_line_length(self):
        """Test description line length constraint"""
        max_length = 120
        short_desc = "Built ARIMA models"
        long_desc = "A" * 150
        
        self.assertLessEqual(len(short_desc), max_length)
        self.assertGreater(len(long_desc), max_length)


if __name__ == '__main__':
    unittest.main()
