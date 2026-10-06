import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Calendar, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { COMPANY_NAME } from '../constants';

export interface JobPosting {
  _id?: string;
  jobId: string;
  type: 'Job' | 'Internship';
  title: string;
  keyContext?: string;
  description: string;
  duration: string;
  workMode: 'Onsite' | 'Remote' | 'Hybrid';
  location: string;
  status: 'Active' | 'Closed' | 'Draft';
  applicationsCount?: number;
}

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosting | null;
}

const QUALIFICATIONS_LIST = [
  'B.Tech / B.E. (Computer Science / IT)',
  'B.Tech / B.E. (ECE / EEE / Mechanical / Civil)',
  'M.Tech / M.E.',
  'MCA / M.Sc (Computer Science / IT)',
  'BCA / B.Sc (Computer Science / IT)',
  'B.Com / BBA / MBA (Finance / Marketing)',
  'Diploma / Polytechnic',
  'Higher Secondary / 12th',
  'Other Degree / Specialization'
];

const SECTORS_LIST = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI/DS)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Commerce / Finance / Taxation',
  'Mechanical / Civil Engineering',
  'Business Administration (MBA/BBA)',
  'Other Stream'
];

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ isOpen, onClose, job }) => {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  // Stage 1 State: Basic Details
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Stage 2 State: Education & Experience
  const [highestQualification, setHighestQualification] = useState(QUALIFICATIONS_LIST[0]);
  const [collegeName, setCollegeName] = useState('');
  const [sector, setSector] = useState(SECTORS_LIST[0]);
  const [placeOfEducation, setPlaceOfEducation] = useState('');
  const [score, setScore] = useState('');
  const [yearOfCompletion, setYearOfCompletion] = useState(new Date().getFullYear().toString());
  const [hasExperience, setHasExperience] = useState<'no' | 'yes'>('no');
  const [jobExperienceDetails, setJobExperienceDetails] = useState('');

  // Stage 3 State: Declaration
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [dob, setDob] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !job) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Resume file size must be less than 10MB');
        return;
      }
      setResumeFile(file);
      setErrorMessage('');
    }
  };

  const validateStage1 = () => {
    if (!resumeFile) {
      setErrorMessage('Please upload your resume (PDF or Word document).');
      return false;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('Please enter a valid phone number (at least 10 digits).');
      return false;
    }
    if (!location.trim()) {
      setErrorMessage('Please enter your place / location.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStage2 = () => {
    if (!collegeName.trim()) {
      setErrorMessage('Please enter your college / university name.');
      return false;
    }
    if (!placeOfEducation.trim()) {
      setErrorMessage('Please enter the location of your college / university.');
      return false;
    }
    if (!score.trim()) {
      setErrorMessage('Please enter your score, CGPA or percentage.');
      return false;
    }
    if (!yearOfCompletion.trim()) {
      setErrorMessage('Please enter your completion / passing year.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const nextStage = () => {
    if (currentStage === 1 && validateStage1()) {
      setCurrentStage(2);
    } else if (currentStage === 2 && validateStage2()) {
      setCurrentStage(3);
    }
  };

  const prevStage = () => {
    setErrorMessage('');
    if (currentStage === 3) setCurrentStage(2);
    else if (currentStage === 2) setCurrentStage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrorMessage('Please acknowledge the self-declaration and agree to terms.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('jobId', job.jobId);
      formData.append('jobTitle', job.title);
      formData.append('jobType', job.type);

      // Stage 1
      if (resumeFile) formData.append('resume', resumeFile);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('location', location);

      // Stage 2
      formData.append('highestQualification', highestQualification);
      formData.append('collegeName', collegeName);
      formData.append('sector', sector);
      formData.append('placeOfEducation', placeOfEducation);
      formData.append('score', score);
      formData.append('yearOfCompletion', yearOfCompletion);
      formData.append('jobExperienceDetails', hasExperience === 'yes' ? jobExperienceDetails : 'Fresher / No prior experience');

      // Stage 3
      formData.append('gender', gender);
      formData.append('dob', dob);
      formData.append('agreedTerms', String(agreedTerms));

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedAppId(data.applicationId || 'FBT-APP-SUCCESS');
      } else {
        setErrorMessage(data.message || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage('Network error submitting application. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStage(1);
    setResumeFile(null);
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setCollegeName('');
    setPlaceOfEducation('');
    setScore('');
    setJobExperienceDetails('');
    setDob('');
    setAgreedTerms(false);
    setSubmittedAppId(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-b border-white/10 p-6 sm:p-8 flex items-start justify-between relative">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                job.type === 'Internship' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {job.type}
              </span>
              <span className="font-mono text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-md border border-white/10">
                ID: {job.jobId}
              </span>
              <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                <MapPin size={12} /> {job.workMode} {job.location ? `• ${job.location}` : ''}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{job.title}</h2>
            <p className="text-xs text-gray-400">Future Bound Tech Candidate Workday Gateway • 3-Stage Quick Process</p>
          </div>

          <button 
            onClick={resetForm}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workday Progress Tracker */}
        {!submittedAppId && (
          <div className="px-6 sm:px-8 py-4 bg-white/[0.02] border-b border-white/5">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
              {/* Step 1 */}
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition-all ${
                currentStage === 1 ? 'bg-blue-600/20 border border-blue-500/40' : currentStage > 1 ? 'text-emerald-400' : 'opacity-40'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStage > 1 ? 'bg-emerald-500 text-black' : currentStage === 1 ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {currentStage > 1 ? <CheckCircle2 size={16} /> : '1'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-black uppercase text-gray-400">Stage 1</div>
                  <div className="text-xs font-bold text-white">Basic Info & Resume</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition-all ${
                currentStage === 2 ? 'bg-blue-600/20 border border-blue-500/40' : currentStage > 2 ? 'text-emerald-400' : 'opacity-40'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStage > 2 ? 'bg-emerald-500 text-black' : currentStage === 2 ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {currentStage > 2 ? <CheckCircle2 size={16} /> : '2'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-black uppercase text-gray-400">Stage 2</div>
                  <div className="text-xs font-bold text-white">Education & Exp</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition-all ${
                currentStage === 3 ? 'bg-blue-600/20 border border-blue-500/40' : 'opacity-40'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStage === 3 ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  3
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-black uppercase text-gray-400">Stage 3</div>
                  <div className="text-xs font-bold text-white">Declaration & Submit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto">
          {submittedAppId ? (
            // Clean & Minimal Success Screen
            <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Application Successfully Submitted!</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Thank you for applying to Future Bound Tech.</p>
              </div>

              {/* Minimal Job ID Card */}
              <div className="inline-block bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-3 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Job ID</span>
                <span className="font-mono text-xl font-black text-emerald-400 tracking-wider">{job.jobId}</span>
              </div>

              <div>
                <button
                  onClick={resetForm}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {/* =========================================
                  STAGE 1: BASIC DETAILS & RESUME
              ========================================= */}
              {currentStage === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <FileText size={18} className="text-blue-400" /> Step 1: Candidate Basic Information
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Please provide your active contact details and latest resume</p>
                  </div>

                  {/* Resume Upload Dropzone */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                      <span>Resume / CV (PDF, DOC, DOCX) <span className="text-red-400">*</span></span>
                      <span className="text-[10px] text-gray-500 font-normal">Max 10MB</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                      resumeFile ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-white/20 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5'
                    }`}>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <FileText size={22} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{resumeFile.name}</p>
                            <p className="text-xs text-emerald-400">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                            <UploadCloud size={24} />
                          </div>
                          <p className="text-sm font-semibold text-white">Click or drag & drop resume here</p>
                          <p className="text-xs text-gray-400">Supports PDF, DOC, DOCX formats</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <User size={12} className="text-blue-400" /> Full Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Mail size={12} className="text-blue-400" /> Email Address <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Phone size={12} className="text-blue-400" /> Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-400" /> Place & Location From <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nellore, Andhra Pradesh"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  STAGE 2: EDUCATION & EXPERIENCE
              ========================================= */}
              {currentStage === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <GraduationCap size={18} className="text-purple-400" /> Step 2: Educational Background & Experience
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Tell us about your college, degree, marks, and prior experience</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Highest Qualification <span className="text-red-400">*</span>
                      </label>
                      <select 
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      >
                        {QUALIFICATIONS_LIST.map(q => <option key={q} value={q} className="bg-[#0b0f19]">{q}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Sector / Stream / Branch <span className="text-red-400">*</span>
                      </label>
                      <select 
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      >
                        {SECTORS_LIST.map(s => <option key={s} value={s} className="bg-[#0b0f19]">{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        College / University Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="e.g. JNTU / SV University / Narayana"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Place of Education (City / State) <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={placeOfEducation}
                        onChange={(e) => setPlaceOfEducation(e.target.value)}
                        placeholder="e.g. Nellore, Andhra Pradesh"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Score / CGPA / Percentage <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="e.g. 8.4 CGPA or 82%"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Year of Completion <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={yearOfCompletion}
                        onChange={(e) => setYearOfCompletion(e.target.value)}
                        placeholder="e.g. 2024 / 2025"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-400" /> Any Prior Job or Internship Experience? (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setHasExperience('no')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            hasExperience === 'no' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Fresher
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasExperience('yes')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            hasExperience === 'yes' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Experienced
                        </button>
                      </div>
                    </div>

                    {hasExperience === 'yes' && (
                      <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
                        <textarea 
                          rows={2}
                          value={jobExperienceDetails}
                          onChange={(e) => setJobExperienceDetails(e.target.value)}
                          placeholder="Mention company name, role, duration (e.g. 6 Months Fullstack Intern at ABC Tech), technologies used..."
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-white text-xs resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================
                  STAGE 3: SELF DECLARATION & SUBMIT
              ========================================= */}
              {currentStage === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-400" /> Step 3: Self Declaration & Review
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Confirm your personal verification details and submit</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Gender <span className="text-red-400">*</span>
                      </label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white text-sm"
                      >
                        <option value="Male" className="bg-[#0b0f19]">Male</option>
                        <option value="Female" className="bg-[#0b0f19]">Female</option>
                        <option value="Other" className="bg-[#0b0f19]">Non-Binary / Other</option>
                        <option value="Prefer not to say" className="bg-[#0b0f19]">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Date of Birth (DOB) <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Review Summary Breakdown */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-2">
                    <div className="font-bold text-white text-sm border-b border-white/10 pb-2 flex items-center justify-between">
                      <span>Application Overview</span>
                      <span className="text-emerald-400 font-mono text-xs">{job.type}: {job.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-400 pt-1">
                      <div><strong className="text-gray-300">Name:</strong> {name}</div>
                      <div><strong className="text-gray-300">Email:</strong> {email}</div>
                      <div><strong className="text-gray-300">Phone:</strong> {phone}</div>
                      <div><strong className="text-gray-300">Location:</strong> {location}</div>
                      <div><strong className="text-gray-300">Qualification:</strong> {highestQualification}</div>
                      <div><strong className="text-gray-300">College:</strong> {collegeName} ({score})</div>
                    </div>
                  </div>

                  {/* Terms & Conditions Agreement */}
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        required
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-300 leading-relaxed">
                        I hereby declare that all information provided in this application is true and accurate to the best of my knowledge. I agree to Future Bound Tech's recruitment terms and consent to receiving communication regarding this application via email and phone.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {currentStage > 1 ? (
                  <button
                    type="button"
                    onClick={prevStage}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : <div></div>}

                {currentStage < 3 ? (
                  <button
                    type="button"
                    onClick={nextStage}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all ml-auto"
                  >
                    Continue to Next Stage <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !agreedTerms}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-xs uppercase tracking-widest font-black flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all disabled:opacity-50 ml-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
