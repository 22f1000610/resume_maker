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
    hsc: { board: '', institute_short: '', year: '', grade_x: '', grade_y: '' },
    ug: { university: '', institute_short: '', year_range: '', grade_x: '', grade_y: '' },
    pg: { year_range: '2024--26', show_grade: true, grade_x: '', grade_y: '' },
    dissertation_selected: false,
    dissertation: {
      title: '',
      guide_name: '',
      duration: '',
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

  const addCourseProject = () => {
    setFormData({
      ...formData,
      course_projects: [
        ...formData.course_projects,
        { title: '', course_code: '', duration: '', one_line_description: '' }
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
        { role: '', org: '', duration: '', bullets: ['', ''] }
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
      alert('Resume generated successfully!');
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="School name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.ssc.institute_short.length}/35</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <input
                    type="text"
                    value={formData.ssc.year}
                    onChange={(e) => handleNestedChange('ssc', 'year', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 2018"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/% *</label>
                  <input
                    type="text"
                    value={formData.ssc.grade_x}
                    onChange={(e) => handleNestedChange('ssc', 'grade_x', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="College name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.hsc.institute_short.length}/35</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Range *</label>
                  <input
                    type="text"
                    value={formData.hsc.year}
                    onChange={(e) => handleNestedChange('hsc', 'year', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 2019--21"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <input
                      type="text"
                      value={formData.hsc.grade_x}
                      onChange={(e) => handleNestedChange('hsc', 'grade_x', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="College Name"
                    maxLength={35}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.ug.institute_short.length}/35</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Range *</label>
                  <input
                    type="text"
                    value={formData.ug.year_range}
                    onChange={(e) => handleNestedChange('ug', 'year_range', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 2021--24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA/Grade *</label>
                    <input
                      type="text"
                      value={formData.ug.grade_x}
                      onChange={(e) => handleNestedChange('ug', 'grade_x', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Range *</label>
                  <input
                    type="text"
                    value={formData.pg.year_range}
                    onChange={(e) => handleNestedChange('pg', 'year_range', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 2024--26"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input
                      type="text"
                      value={formData.dissertation.duration}
                      onChange={(e) => handleNestedChange('dissertation', 'duration', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Aug'25–Present"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                        <input
                          type="text"
                          value={paper.duration}
                          onChange={(e) => updateTermPaper(index, 'duration', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Mon'YY--Mon'YY"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input
                      type="text"
                      value={project.duration}
                      onChange={(e) => updateCourseProject(index, 'duration', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Mon'YY--Mon'YY"
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
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> Only select skills you truly possess. Quality over quantity!
              </p>
            </div>
          </div>
        );

      case 5: // Experience
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Work Experience & Internships</h2>
            
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Mon'YY--Mon'YY"
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

            {formData.experience.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  💡 <strong>No work experience?</strong> Include voluntary work, teaching assistance, 
                  or significant course-related tasks!
                </p>
              </div>
            )}
          </div>
        );

      case 6: // Awards
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Awards & Achievements / Extra-Curricular</h2>
            
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

            {formData.awards.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  💡 <strong>Tip:</strong> Include academic awards, presentations at conferences, 
                  or participation in workshops and competitions!
                </p>
              </div>
            )}
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
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
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
