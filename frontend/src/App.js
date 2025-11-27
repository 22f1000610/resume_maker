import React, { useState } from 'react';
import { SKILLS_DATA, SKILLS_CATEGORIES } from './skillsData';
import { 
  generateLatex, 
  generateResume, 
  downloadBlob, 
  downloadText,
  sanitizeFilename 
} from './latexGenerator';
import './index.css';

// Month and Year options for dropdowns
const MONTHS = [
  { value: '', label: 'Month' },
  { value: "Jan", label: 'January' },
  { value: "Feb", label: 'February' },
  { value: "Mar", label: 'March' },
  { value: "Apr", label: 'April' },
  { value: "May", label: 'May' },
  { value: "Jun", label: 'June' },
  { value: "Jul", label: 'July' },
  { value: "Aug", label: 'August' },
  { value: "Sep", label: 'September' },
  { value: "Oct", label: 'October' },
  { value: "Nov", label: 'November' },
  { value: "Dec", label: 'December' }
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'Year' },
  ...Array.from({ length: 30 }, (_, i) => {
    const year = currentYear + 5 - i;
    return { value: year.toString(), label: year.toString() };
  })
];

// Helper to format year range like "2021--24"
const formatYearRange = (startYear, endYear) => {
  if (!startYear) return '';
  if (!endYear) return startYear;
  const endShort = endYear.toString().slice(-2);
  return `${startYear}--${endShort}`;
};

// Helper to format duration like "Aug'25–Present" or "Aug'24–Nov'24"
const formatDuration = (startMonth, startYear, endMonth, endYear, isPresent = false) => {
  if (!startMonth || !startYear) return '';
  const startYearShort = startYear.toString().slice(-2);
  const start = `${startMonth}'${startYearShort}`;
  if (isPresent) return `${start}–Present`;
  if (!endMonth || !endYear) return start;
  const endYearShort = endYear.toString().slice(-2);
  return `${start}–${endMonth}'${endYearShort}`;
};

// Year Picker Component (single year)
const YearPicker = ({ value, onChange, label, required, error, className = '' }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
    >
      {YEARS.map(y => (
        <option key={y.value} value={y.value}>{y.label}</option>
      ))}
    </select>
  </div>
);

// Year Range Picker Component (start year - end year)
const YearRangePicker = ({ startYear, endYear, onStartChange, onEndChange, label, required, error }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <div className="grid grid-cols-2 gap-2">
      <select
        value={startYear || ''}
        onChange={(e) => onStartChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Start Year</option>
        {YEARS.slice(1).map(y => (
          <option key={y.value} value={y.value}>{y.label}</option>
        ))}
      </select>
      <select
        value={endYear || ''}
        onChange={(e) => onEndChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">End Year</option>
        {YEARS.slice(1).map(y => (
          <option key={y.value} value={y.value}>{y.label}</option>
        ))}
      </select>
    </div>
  </div>
);

// Duration Picker Component (Month/Year - Month/Year with Present option)
const DurationPicker = ({ 
  startMonth, startYear, endMonth, endYear, isPresent,
  onStartMonthChange, onStartYearChange, onEndMonthChange, onEndYearChange, onPresentChange,
  label, required, showPresent = true 
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-500 w-12">From:</span>
        <select
          value={startMonth || ''}
          onChange={(e) => onStartMonthChange(e.target.value)}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={startYear || ''}
          onChange={(e) => onStartYearChange(e.target.value)}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {YEARS.map(y => (
            <option key={y.value} value={y.value}>{y.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-500 w-12">To:</span>
        {showPresent && isPresent ? (
          <span className="flex-1 px-2 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">Present</span>
        ) : (
          <>
            <select
              value={endMonth || ''}
              onChange={(e) => onEndMonthChange(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              disabled={isPresent}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={endYear || ''}
              onChange={(e) => onEndYearChange(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              disabled={isPresent}
            >
              {YEARS.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </>
        )}
      </div>
      {showPresent && (
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPresent || false}
            onChange={(e) => onPresentChange(e.target.checked)}
            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">Currently ongoing</span>
        </label>
      )}
    </div>
  </div>
);

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    program: 'Applied Economics',
    batch: '2024-26',
    gender: 'Male',
    ssc: { board: '', institute_short: '', year: '', grade_x: '', grade_y: '' },
    hsc: { board: '', institute_short: '', year: '', startYear: '', endYear: '', grade_x: '', grade_y: '' },
    ug: { university: '', institute_short: '', year_range: '', startYear: '', endYear: '', grade_x: '', grade_y: '' },
    pg: { year_range: '2024--26', startYear: '2024', endYear: '2026', show_grade: true, grade_x: '', grade_y: '' },
    dissertation_selected: false,
    dissertation: {
      title: '',
      guide_name: '',
      duration: '',
      startMonth: '', startYear: '', endMonth: '', endYear: '', isPresent: true,
      current_work_lines: ['', ''],
      future_work_lines: ['', '']
    },
    term_papers: [],
    course_projects: [],
    skills: {
      econometrics: [],
      ml: [],
      business: [],
      programming: [],
      research: []
    },
    otherSkills: {
      econometrics: '',
      ml: '',
      business: '',
      programming: '',
      research: ''
    },
    experience: [],
    awards: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [latexPreview, setLatexPreview] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [pdfBlob, setPdfBlob] = useState(null);

  const steps = [
    'Header & Personal Info',
    'Education',
    'Dissertation / Term Papers',
    'Course Projects',
    'Skills',
    'Experience',
    'Awards',
    'Preview & Generate'
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'first_name' || name === 'last_name') {
      if (value.length > 40) {
        newErrors[name] = 'Maximum 40 characters allowed';
      } else {
        delete newErrors[name];
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: value }
    });
  };

  const handleSkillToggle = (category, skill) => {
    const currentSkills = formData.skills[category];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    setFormData({
      ...formData,
      skills: { ...formData.skills, [category]: newSkills }
    });
  };

  const handleOtherSkillChange = (category, value) => {
    setFormData({
      ...formData,
      otherSkills: { ...formData.otherSkills, [category]: value }
    });
  };

  // Step-based validation
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Info
        if (!formData.first_name.trim()) {
          newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
          newErrors.last_name = 'Last name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
          }
        }
        break;
        
      case 1: // Education
        // SSC validation
        if (!formData.ssc.board.trim()) newErrors.ssc_board = 'SSC board is required';
        if (!formData.ssc.institute_short.trim()) newErrors.ssc_institute = 'SSC school is required';
        if (!formData.ssc.year.trim()) newErrors.ssc_year = 'SSC year is required';
        if (!formData.ssc.grade_x.trim()) newErrors.ssc_grade = 'SSC grade is required';
        
        // HSC validation
        if (!formData.hsc.board.trim()) newErrors.hsc_board = 'HSC board is required';
        if (!formData.hsc.institute_short.trim()) newErrors.hsc_institute = 'HSC school is required';
        if (!formData.hsc.year.trim()) newErrors.hsc_year = 'HSC year is required';
        if (!formData.hsc.grade_x.trim()) newErrors.hsc_grade = 'HSC grade is required';
        
        // UG validation
        if (!formData.ug.university.trim()) newErrors.ug_university = 'UG university is required';
        if (!formData.ug.institute_short.trim()) newErrors.ug_institute = 'UG institute is required';
        if (!formData.ug.year_range.trim()) newErrors.ug_year = 'UG year range is required';
        if (!formData.ug.grade_x.trim()) newErrors.ug_grade = 'UG grade is required';
        break;
        
      case 2: // Dissertation/Term Papers
        if (formData.dissertation_selected) {
          if (!formData.dissertation.title.trim()) newErrors.diss_title = 'Dissertation title is required';
          if (!formData.dissertation.guide_name.trim()) newErrors.diss_guide = 'Guide name is required';
          if (!formData.dissertation.duration.trim()) newErrors.diss_duration = 'Duration is required';
        }
        // Validate term papers if any exist
        formData.term_papers.forEach((paper, idx) => {
          if (!paper.title.trim()) newErrors[`term_paper_${idx}_title`] = `Term paper ${idx + 1} title is required`;
        });
        break;
        
      case 3: // Course Projects
        // Validate course projects if any exist
        formData.course_projects.forEach((project, idx) => {
          if (!project.title.trim()) newErrors[`project_${idx}_title`] = `Project ${idx + 1} title is required`;
          if (!project.course_code.trim()) newErrors[`project_${idx}_code`] = `Project ${idx + 1} course code is required`;
        });
        break;
        
      case 4: // Skills
        // At least some skills should be selected (either from chips or custom)
        const hasAnySkills = Object.values(formData.skills).some(arr => arr.length > 0) ||
                           Object.values(formData.otherSkills).some(s => s.trim());
        if (!hasAnySkills) {
          newErrors.skills = 'Please select at least one skill or add custom skills';
        }
        break;
        
      case 5: // Experience
        // Validate experiences if any exist
        formData.experience.forEach((exp, idx) => {
          if (!exp.role.trim()) newErrors[`exp_${idx}_role`] = `Experience ${idx + 1} role is required`;
          if (!exp.org.trim()) newErrors[`exp_${idx}_org`] = `Experience ${idx + 1} organization is required`;
        });
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    }
  };

  const addCourseProject = () => {
    setFormData({
      ...formData,
      course_projects: [
        ...formData.course_projects,
        { title: '', course_code: '', duration: '', startMonth: '', startYear: '', endMonth: '', endYear: '', one_line_description: '' }
      ]
    });
  };

  const updateCourseProject = (index, field, value) => {
    const newProjects = [...formData.course_projects];
    newProjects[index][field] = value;
    
    // Validate course code
    if (field === 'course_code') {
      const codeRegex = /^AE-\d{3}$/;
      const newErrors = { ...errors };
      if (value && !codeRegex.test(value)) {
        newErrors[`course_code_${index}`] = 'Must be AE-XXX format (e.g., AE-201)';
      } else {
        delete newErrors[`course_code_${index}`];
      }
      setErrors(newErrors);
    }
    
    // Validate description length
    if (field === 'one_line_description') {
      const newErrors = { ...errors };
      if (value.length > 120) {
        newErrors[`project_desc_${index}`] = 'Maximum 120 characters';
      } else {
        delete newErrors[`project_desc_${index}`];
      }
      setErrors(newErrors);
    }
    
    setFormData({ ...formData, course_projects: newProjects });
  };

  const removeCourseProject = (index) => {
    const newProjects = formData.course_projects.filter((_, i) => i !== index);
    setFormData({ ...formData, course_projects: newProjects });
  };

  const addTermPaper = () => {
    if (formData.term_papers.length >= 2) {
      alert('Maximum 2 term papers allowed');
      return;
    }
    
    setFormData({
      ...formData,
      term_papers: [
        ...formData.term_papers,
        {
          title: '',
          guided: false,
          guide_name: '',
          duration: '',
          startMonth: '', startYear: '', endMonth: '', endYear: '',
          description_lines: [''],
          grade: ''
        }
      ]
    });
  };

  const updateTermPaper = (index, field, value) => {
    const newPapers = [...formData.term_papers];
    newPapers[index][field] = value;
    setFormData({ ...formData, term_papers: newPapers });
  };

  const removeTermPaper = (index) => {
    const newPapers = formData.term_papers.filter((_, i) => i !== index);
    setFormData({ ...formData, term_papers: newPapers });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { role: '', org: '', duration: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isPresent: false, bullets: ['', ''] }
      ]
    });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const removeExperience = (index) => {
    const newExp = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExp });
  };

  const addAward = () => {
    setFormData({
      ...formData,
      awards: [...formData.awards, '']
    });
  };

  const updateAward = (index, value) => {
    const newAwards = [...formData.awards];
    newAwards[index] = value;
    
    // Validate length
    const newErrors = { ...errors };
    if (value.length > 120) {
      newErrors[`award_${index}`] = 'Maximum 120 characters';
    } else {
      delete newErrors[`award_${index}`];
    }
    setErrors(newErrors);
    
    setFormData({ ...formData, awards: newAwards });
  };

  const removeAward = (index) => {
    const newAwards = formData.awards.filter((_, i) => i !== index);
    setFormData({ ...formData, awards: newAwards });
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      const latex = generateLatex(formData);
      setLatexPreview(latex);
    } catch (error) {
      alert('Error generating preview: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      const result = await generateResume(formData);
      
      if (result.error) {
        alert('Error generating resume: ' + result.error);
        return;
      }
      
      setLatexPreview(result.latex);
      setPdfBlob(result.pdf);
      setGeneratedFiles({
        tex: true,
        pdf: result.pdf !== null
      });
      
      // Auto-download PDF if generation was successful
      if (result.pdf) {
        const firstName = sanitizeFilename(formData.first_name || '');
        const lastName = sanitizeFilename(formData.last_name || '');
        const baseName = firstName && lastName ? `${firstName}_${lastName}` : firstName || lastName || 'resume';
        downloadBlob(result.pdf, `${baseName}.pdf`);
        alert('Resume generated and downloaded successfully!');
      } else {
        alert('Resume generated successfully! Click "Download .pdf" to save.');
      }
    } catch (error) {
      alert('Error generating resume: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTex = () => {
    const firstName = sanitizeFilename(formData.first_name || '');
    const lastName = sanitizeFilename(formData.last_name || '');
    const baseName = firstName && lastName ? `${firstName}_${lastName}` : firstName || lastName || 'resume';
    downloadText(latexPreview, `${baseName}.tex`, 'application/x-latex');
  };

  const handleDownloadPdf = () => {
    if (pdfBlob) {
      const firstName = sanitizeFilename(formData.first_name || '');
      const lastName = sanitizeFilename(formData.last_name || '');
      const baseName = firstName && lastName ? `${firstName}_${lastName}` : firstName || lastName || 'resume';
      downloadBlob(pdfBlob, `${baseName}.pdf`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Header & Personal Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter first name"
                  maxLength={40}
                  required
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter last name"
                  maxLength={40}
                  required
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@cds.ac.in"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch *
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="2024-26">2024-26</option>
                  <option value="2025-27">2025-27</option>
                  <option value="2026-28">2026-28</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Education
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Education</h2>
            
            {/* Validation Errors */}
            {Object.keys(errors).some(k => k.startsWith('ssc_') || k.startsWith('hsc_') || k.startsWith('ug_')) && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <p className="font-semibold mb-2">Please fill in all required fields:</p>
                <ul className="list-disc list-inside text-sm">
                  {Object.entries(errors).filter(([k]) => k.startsWith('ssc_') || k.startsWith('hsc_') || k.startsWith('ug_')).map(([key, msg]) => (
                    <li key={key}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* SSC */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Matriculation (SSC)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board *</label>
                  <input
                    type="text"
                    value={formData.ssc.board}
                    onChange={(e) => handleNestedChange('ssc', 'board', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ssc_board ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., CBSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute (≤35 chars) *
                  </label>
                  <input
                    type="text"
                    value={formData.ssc.institute_short}
                    onChange={(e) => handleNestedChange('ssc', 'institute_short', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ssc_institute ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="School name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.ssc.institute_short.length}/35</p>
                </div>
                <div>
                  <YearPicker
                    label="Year"
                    required
                    value={formData.ssc.year}
                    onChange={(value) => handleNestedChange('ssc', 'year', value)}
                    error={errors.ssc_year}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/% *</label>
                  <input
                    type="text"
                    value={formData.ssc.grade_x}
                    onChange={(e) => handleNestedChange('ssc', 'grade_x', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ssc_grade ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 93.21 or 9.3"
                  />
                </div>
              </div>
            </div>

            {/* HSC */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Intermediate/+2 (HSC)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board *</label>
                  <input
                    type="text"
                    value={formData.hsc.board}
                    onChange={(e) => handleNestedChange('hsc', 'board', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.hsc_board ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., HSC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute (≤35 chars) *
                  </label>
                  <input
                    type="text"
                    value={formData.hsc.institute_short}
                    onChange={(e) => handleNestedChange('hsc', 'institute_short', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.hsc_institute ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="College name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.hsc.institute_short.length}/35</p>
                </div>
                <div>
                  <YearRangePicker
                    label="Year Range"
                    required
                    startYear={formData.hsc.startYear}
                    endYear={formData.hsc.endYear}
                    onStartChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        hsc: { ...prev.hsc, startYear: value, year: formatYearRange(value, prev.hsc.endYear) }
                      }));
                    }}
                    onEndChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        hsc: { ...prev.hsc, endYear: value, year: formatYearRange(prev.hsc.startYear, value) }
                      }));
                    }}
                    error={errors.hsc_year}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <input
                      type="text"
                      value={formData.hsc.grade_x}
                      onChange={(e) => handleNestedChange('hsc', 'grade_x', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.hsc_grade ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="90.23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Out of (optional)</label>
                    <input
                      type="text"
                      value={formData.hsc.grade_y}
                      onChange={(e) => handleNestedChange('hsc', 'grade_y', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* UG */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Graduation (UG)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                  <input
                    type="text"
                    value={formData.ug.university}
                    onChange={(e) => handleNestedChange('ug', 'university', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ug_university ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute (≤35 chars) *
                  </label>
                  <input
                    type="text"
                    value={formData.ug.institute_short}
                    onChange={(e) => handleNestedChange('ug', 'institute_short', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ug_institute ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="College Name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.ug.institute_short.length}/35</p>
                </div>
                <div>
                  <YearRangePicker
                    label="Year Range"
                    required
                    startYear={formData.ug.startYear}
                    endYear={formData.ug.endYear}
                    onStartChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        ug: { ...prev.ug, startYear: value, year_range: formatYearRange(value, prev.ug.endYear) }
                      }));
                    }}
                    onEndChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        ug: { ...prev.ug, endYear: value, year_range: formatYearRange(prev.ug.startYear, value) }
                      }));
                    }}
                    error={errors.ug_year}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA/Grade *</label>
                    <input
                      type="text"
                      value={formData.ug.grade_x}
                      onChange={(e) => handleNestedChange('ug', 'grade_x', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.ug_grade ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="8.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Out of *</label>
                    <input
                      type="text"
                      value={formData.ug.grade_y}
                      onChange={(e) => handleNestedChange('ug', 'grade_y', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PG */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Post Graduation (PG)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <YearRangePicker
                    label="Year Range"
                    required
                    startYear={formData.pg.startYear}
                    endYear={formData.pg.endYear}
                    onStartChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        pg: { ...prev.pg, startYear: value, year_range: formatYearRange(value, prev.pg.endYear) }
                      }));
                    }}
                    onEndChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        pg: { ...prev.pg, endYear: value, year_range: formatYearRange(prev.pg.startYear, value) }
                      }));
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pg.show_grade}
                      onChange={(e) => handleNestedChange('pg', 'show_grade', e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Grade</span>
                  </label>
                </div>
                {formData.pg.show_grade && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CGPA *</label>
                      <input
                        type="text"
                        value={formData.pg.grade_x}
                        onChange={(e) => handleNestedChange('pg', 'grade_x', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Out of *</label>
                      <input
                        type="text"
                        value={formData.pg.grade_y}
                        onChange={(e) => handleNestedChange('pg', 'grade_y', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="9"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Dissertation / Term Papers
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">M.A. Dissertation & Projects</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                💡 <strong>Tips for Dissertation/Term Papers:</strong>
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li><strong>Title:</strong> Use a clear, specific title (e.g., "Impact of Monetary Policy on Credit Growth in India")</li>
                <li><strong>Current Work:</strong> Describe what you've done so far - data collection, methodology, preliminary findings</li>
                <li><strong>Future Work:</strong> Mention planned analysis, extensions, or expected outcomes</li>
                <li><strong>Examples:</strong> "Constructing panel dataset using RBI/CMIE data", "Estimating using GMM/IV methods", "Heterogeneity analysis by sector"</li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dissertation Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.dissertation_selected}
                    onChange={() => setFormData({ ...formData, dissertation_selected: true })}
                    className="mr-2"
                  />
                  <span>I am doing / have done a Dissertation</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.dissertation_selected}
                    onChange={() => setFormData({ ...formData, dissertation_selected: false })}
                    className="mr-2"
                  />
                  <span>I have Term Papers instead</span>
                </label>
              </div>
            </div>

            {formData.dissertation_selected ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg">Dissertation Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.dissertation.title}
                    onChange={(e) => handleNestedChange('dissertation', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Dissertation Title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guide Name *</label>
                    <input
                      type="text"
                      value={formData.dissertation.guide_name}
                      onChange={(e) => handleNestedChange('dissertation', 'guide_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Prof. XYZ"
                    />
                  </div>
                  <div>
                    <DurationPicker
                      label="Duration"
                      required
                      startMonth={formData.dissertation.startMonth}
                      startYear={formData.dissertation.startYear}
                      endMonth={formData.dissertation.endMonth}
                      endYear={formData.dissertation.endYear}
                      isPresent={formData.dissertation.isPresent}
                      onStartMonthChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dissertation: { ...prev.dissertation, startMonth: value, duration: formatDuration(value, prev.dissertation.startYear, prev.dissertation.endMonth, prev.dissertation.endYear, prev.dissertation.isPresent) }
                        }));
                      }}
                      onStartYearChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dissertation: { ...prev.dissertation, startYear: value, duration: formatDuration(prev.dissertation.startMonth, value, prev.dissertation.endMonth, prev.dissertation.endYear, prev.dissertation.isPresent) }
                        }));
                      }}
                      onEndMonthChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dissertation: { ...prev.dissertation, endMonth: value, duration: formatDuration(prev.dissertation.startMonth, prev.dissertation.startYear, value, prev.dissertation.endYear, prev.dissertation.isPresent) }
                        }));
                      }}
                      onEndYearChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dissertation: { ...prev.dissertation, endYear: value, duration: formatDuration(prev.dissertation.startMonth, prev.dissertation.startYear, prev.dissertation.endMonth, value, prev.dissertation.isPresent) }
                        }));
                      }}
                      onPresentChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          dissertation: { ...prev.dissertation, isPresent: value, duration: formatDuration(prev.dissertation.startMonth, prev.dissertation.startYear, prev.dissertation.endMonth, prev.dissertation.endYear, value) }
                        }));
                      }}
                      showPresent={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Work (Max 2 lines, ≤120 chars each)
                  </label>
                  {[0, 1].map((i) => (
                    <div key={i} className="mb-2">
                      <input
                        type="text"
                        value={formData.dissertation.current_work_lines[i]}
                        onChange={(e) => {
                          const newLines = [...formData.dissertation.current_work_lines];
                          newLines[i] = e.target.value;
                          handleNestedChange('dissertation', 'current_work_lines', newLines);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder={`Current work line ${i + 1}`}
                        maxLength={120}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.dissertation.current_work_lines[i].length}/120
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Future Work (Max 2 lines, ≤120 chars each)
                  </label>
                  {[0, 1].map((i) => (
                    <div key={i} className="mb-2">
                      <input
                        type="text"
                        value={formData.dissertation.future_work_lines[i]}
                        onChange={(e) => {
                          const newLines = [...formData.dissertation.future_work_lines];
                          newLines[i] = e.target.value;
                          handleNestedChange('dissertation', 'future_work_lines', newLines);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder={`Future work line ${i + 1}`}
                        maxLength={120}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.dissertation.future_work_lines[i].length}/120
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.term_papers.map((paper, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Term Paper {index + 1}</h3>
                      <button
                        onClick={() => removeTermPaper(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={paper.title}
                        onChange={(e) => updateTermPaper(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Term Paper Title"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paper.guided}
                          onChange={(e) => updateTermPaper(index, 'guided', e.target.checked)}
                          className="mr-2 h-4 w-4 text-primary-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Guided</span>
                      </label>
                    </div>

                    {paper.guided && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guide Name *</label>
                        <input
                          type="text"
                          value={paper.guide_name}
                          onChange={(e) => updateTermPaper(index, 'guide_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Prof. ABC"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <DurationPicker
                          label="Duration"
                          required
                          startMonth={paper.startMonth}
                          startYear={paper.startYear}
                          endMonth={paper.endMonth}
                          endYear={paper.endYear}
                          isPresent={false}
                          onStartMonthChange={(value) => {
                            const newPapers = [...formData.term_papers];
                            newPapers[index] = { ...newPapers[index], startMonth: value, duration: formatDuration(value, paper.startYear, paper.endMonth, paper.endYear, false) };
                            setFormData(prev => ({ ...prev, term_papers: newPapers }));
                          }}
                          onStartYearChange={(value) => {
                            const newPapers = [...formData.term_papers];
                            newPapers[index] = { ...newPapers[index], startYear: value, duration: formatDuration(paper.startMonth, value, paper.endMonth, paper.endYear, false) };
                            setFormData(prev => ({ ...prev, term_papers: newPapers }));
                          }}
                          onEndMonthChange={(value) => {
                            const newPapers = [...formData.term_papers];
                            newPapers[index] = { ...newPapers[index], endMonth: value, duration: formatDuration(paper.startMonth, paper.startYear, value, paper.endYear, false) };
                            setFormData(prev => ({ ...prev, term_papers: newPapers }));
                          }}
                          onEndYearChange={(value) => {
                            const newPapers = [...formData.term_papers];
                            newPapers[index] = { ...newPapers[index], endYear: value, duration: formatDuration(paper.startMonth, paper.startYear, paper.endMonth, value, false) };
                            setFormData(prev => ({ ...prev, term_papers: newPapers }));
                          }}
                          onPresentChange={() => {}}
                          showPresent={false}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade (optional)</label>
                        <input
                          type="text"
                          value={paper.grade}
                          onChange={(e) => updateTermPaper(index, 'grade', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., A+ or 9/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (≤120 chars per line)
                      </label>
                      {paper.description_lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="mb-2">
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => {
                              const newLines = [...paper.description_lines];
                              newLines[lineIndex] = e.target.value;
                              updateTermPaper(index, 'description_lines', newLines);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder={`Description line ${lineIndex + 1}`}
                            maxLength={120}
                          />
                          <p className="text-xs text-gray-500 mt-1">{line.length}/120</p>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          if (paper.description_lines.length < 3) {
                            updateTermPaper(index, 'description_lines', [...paper.description_lines, '']);
                          }
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        disabled={paper.description_lines.length >= 3}
                      >
                        + Add description line
                      </button>
                    </div>
                  </div>
                ))}

                {formData.term_papers.length < 2 && (
                  <button
                    onClick={addTermPaper}
                    className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    + Add Term Paper
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 3: // Course Projects
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Course Projects</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                💡 <strong>Tips for Course Projects:</strong>
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li><strong>Title:</strong> Use a descriptive title (e.g., "Time Series Forecasting of Inflation in India")</li>
                <li><strong>Course Code:</strong> Use the format AE-XXX (e.g., AE-201 for Econometrics)</li>
                <li><strong>Description:</strong> Highlight methodology, tools used, and key findings in one line</li>
                <li><strong>Examples:</strong> "Built ARIMA/VAR models; achieved 15% lower RMSE", "Panel data analysis using STATA; identified key determinants"</li>
              </ul>
            </div>
            
            {formData.course_projects.map((project, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Project {index + 1}</h3>
                  <button
                    onClick={() => removeCourseProject(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateCourseProject(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Project Title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Code (AE-XXX) *
                    </label>
                    <input
                      type="text"
                      value={project.course_code}
                      onChange={(e) => updateCourseProject(index, 'course_code', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., AE-201"
                    />
                    {errors[`course_code_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`course_code_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <DurationPicker
                      label="Duration"
                      required
                      startMonth={project.startMonth}
                      startYear={project.startYear}
                      endMonth={project.endMonth}
                      endYear={project.endYear}
                      isPresent={false}
                      onStartMonthChange={(value) => {
                        const newProjects = [...formData.course_projects];
                        newProjects[index] = { ...newProjects[index], startMonth: value, duration: formatDuration(value, project.startYear, project.endMonth, project.endYear, false) };
                        setFormData(prev => ({ ...prev, course_projects: newProjects }));
                      }}
                      onStartYearChange={(value) => {
                        const newProjects = [...formData.course_projects];
                        newProjects[index] = { ...newProjects[index], startYear: value, duration: formatDuration(project.startMonth, value, project.endMonth, project.endYear, false) };
                        setFormData(prev => ({ ...prev, course_projects: newProjects }));
                      }}
                      onEndMonthChange={(value) => {
                        const newProjects = [...formData.course_projects];
                        newProjects[index] = { ...newProjects[index], endMonth: value, duration: formatDuration(project.startMonth, project.startYear, value, project.endYear, false) };
                        setFormData(prev => ({ ...prev, course_projects: newProjects }));
                      }}
                      onEndYearChange={(value) => {
                        const newProjects = [...formData.course_projects];
                        newProjects[index] = { ...newProjects[index], endYear: value, duration: formatDuration(project.startMonth, project.startYear, project.endMonth, value, false) };
                        setFormData(prev => ({ ...prev, course_projects: newProjects }));
                      }}
                      onPresentChange={() => {}}
                      showPresent={false}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    One-line Description (≤120 chars) *
                  </label>
                  <input
                    type="text"
                    value={project.one_line_description}
                    onChange={(e) => updateCourseProject(index, 'one_line_description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description of the project"
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">{project.one_line_description.length}/120</p>
                  {errors[`project_desc_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`project_desc_${index}`]}</p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addCourseProject}
              className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              + Add Course Project
            </button>
          </div>
        );

      case 4: // Skills
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Technical Skills</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> Only select skills you truly possess. Quality over quantity! 
                Use the "Other" field to add skills not in the list.
              </p>
            </div>
            
            {errors.skills && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg">
                {errors.skills}
              </div>
            )}
            
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Search skills..."
              />
            </div>

            {Object.entries(SKILLS_DATA).map(([category, skills]) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{SKILLS_CATEGORIES[category]}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter(skill => 
                      skill.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleSkillToggle(category, skill)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.skills[category].includes(skill)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                </div>
                {formData.skills[category].length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {formData.skills[category].join(', ')}
                  </div>
                )}
                
                {/* Other Skills Input */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other {SKILLS_CATEGORIES[category]} (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.otherSkills[category]}
                    onChange={(e) => handleOtherSkillChange(category, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g., Skill 1, Skill 2, Skill 3"
                  />
                  {formData.otherSkills[category] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Custom skills will be added to your resume
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 5: // Experience
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Work Experience & Internships</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> No work experience? Include voluntary work, research assistance, 
                teaching assistance, or significant course-related tasks!
              </p>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Experience {index + 1}</h3>
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Research Intern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                    <input
                      type="text"
                      value={exp.org}
                      onChange={(e) => updateExperience(index, 'org', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Organization Name"
                    />
                  </div>
                </div>

                <div>
                  <DurationPicker
                    label="Duration"
                    required
                    startMonth={exp.startMonth}
                    startYear={exp.startYear}
                    endMonth={exp.endMonth}
                    endYear={exp.endYear}
                    isPresent={exp.isPresent}
                    onStartMonthChange={(value) => {
                      const newExperience = [...formData.experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        startMonth: value,
                        duration: formatDuration(value, exp.startYear, exp.endMonth, exp.endYear, exp.isPresent)
                      };
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    onStartYearChange={(value) => {
                      const newExperience = [...formData.experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        startYear: value,
                        duration: formatDuration(exp.startMonth, value, exp.endMonth, exp.endYear, exp.isPresent)
                      };
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    onEndMonthChange={(value) => {
                      const newExperience = [...formData.experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        endMonth: value,
                        duration: formatDuration(exp.startMonth, exp.startYear, value, exp.endYear, exp.isPresent)
                      };
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    onEndYearChange={(value) => {
                      const newExperience = [...formData.experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        endYear: value,
                        duration: formatDuration(exp.startMonth, exp.startYear, exp.endMonth, value, exp.isPresent)
                      };
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    onPresentChange={(value) => {
                      const newExperience = [...formData.experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        isPresent: value,
                        duration: formatDuration(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, value)
                      };
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    showPresent={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (Max 4 bullets, ≤120 chars each)
                  </label>
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="mb-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[bulletIndex] = e.target.value;
                          updateExperience(index, 'bullets', newBullets);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder={`Responsibility ${bulletIndex + 1}`}
                        maxLength={120}
                      />
                      <p className="text-xs text-gray-500 mt-1">{bullet.length}/120</p>
                    </div>
                  ))}
                  {exp.bullets.length < 4 && (
                    <button
                      onClick={() => updateExperience(index, 'bullets', [...exp.bullets, ''])}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add bullet point
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addExperience}
              className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              + Add Experience
            </button>
          </div>
        );

      case 6: // Awards
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Awards & Achievements / Extra-Curricular</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> Include academic awards, presentations at conferences, 
                participation in workshops, competitions, or extra-curricular achievements!
              </p>
            </div>
            
            {formData.awards.map((award, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={award}
                  onChange={(e) => updateAward(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Award or achievement (≤120 chars)"
                  maxLength={120}
                />
                <button
                  onClick={() => removeAward(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={addAward}
              className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              + Add Award/Achievement
            </button>
          </div>
        );

      case 7: // Preview & Generate
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Preview & Generate</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Note:</strong> This app generates PDFs using a serverless LaTeX API. 
                No backend required - works entirely in your browser!
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={generatePreview}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Preview LaTeX'}
              </button>
              
              <button
                onClick={handleGenerateResume}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate & Compile PDF'}
              </button>
            </div>

            {latexPreview && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">LaTeX Preview</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(latexPreview)}
                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Copy LaTeX
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96 text-xs font-mono">
                  {latexPreview}
                </pre>
              </div>
            )}

            {generatedFiles && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-green-800">
                  ✓ Resume Generated Successfully!
                </h3>
                <div className="space-y-2">
                  {generatedFiles.tex && (
                    <button
                      onClick={handleDownloadTex}
                      className="w-full py-2 px-4 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50"
                    >
                      Download .tex
                    </button>
                  )}
                  {generatedFiles.pdf && (
                    <button
                      onClick={handleDownloadPdf}
                      className="w-full py-2 px-4 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50"
                    >
                      Download .pdf
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  PDF generated using serverless LaTeX API (latex.ytotech.com)
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CDS JNU Resume Maker
          </h1>
          <p className="text-gray-600">
            Create your M.A. Resume — quick, clean, and downloadable (.tex, .pdf)
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index < steps.length - 1 ? 'border-r border-gray-300' : ''
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-1 ${
                    index === currentStep
                      ? 'bg-primary-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div
                  className={`text-xs ${
                    index === currentStep ? 'text-primary-600 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
