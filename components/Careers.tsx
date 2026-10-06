import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Building2, 
  MapPin, 
  Mail, 
  User, 
  Phone, 
  Send, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  Layers,
  Code2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Award
} from 'lucide-react';
import { COMPANY_NAME, CAREER_DOMAINS } from '../constants';
import JobApplicationModal, { JobPosting } from './JobApplicationModal';
import JobDetailModal from './JobDetailModal';
import OfferVerificationModal from './OfferVerificationModal';

const QUALIFICATIONS = [
  'B.Tech / B.E.',
  'M.Tech / M.E.',
  'MCA / M.Sc (CS/IT)',
  'BCA / B.Sc (CS/IT)',
  'Bachelor Degree (Other)',
  'Master Degree (Other)',
  'Diploma / Polytechnic',
  'Higher Secondary / 12th',
  'Other Qualification'
];

interface CareersProps {
  onBackToHome?: () => void;
}

const Careers: React.FC<CareersProps> = ({ onBackToHome }) => {
  // Navigation & Tabs
  const [activeView, setActiveView] = useState<'openings' | 'generalApply'>('openings');

  // Jobs state
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Job' | 'Internship'>('All');
  const [workModeFilter, setWorkModeFilter] = useState<'All' | 'Remote' | 'Onsite' | 'Hybrid'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Job for Application Modal
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobPosting | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Selected Job for 80% Full Screen Detail Modal
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobPosting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Offer Verification Modal
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // General Application Form State (Legacy / Spontaneous applicants)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    institute_university: '',
    qualification: 'B.Tech / B.E.',
    domain: 'Associate Software Developer',
    message: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch Jobs from backend
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/jobs?status=Active');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
      }
    } catch (err) {
      console.warn('Could not fetch jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenJobApply = (job: JobPosting) => {
    setSelectedJobForApply(job);
    setIsApplyModalOpen(true);
  };

  const handleOpenJobDetails = (job: JobPosting) => {
    setSelectedJobForDetails(job);
    setIsDetailModalOpen(true);
  };

  const handleGeneralFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneralFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const res = await fetch('/api/careers', {
        method: 'POST',
        body: submitData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          state: '',
          city: '',
          institute_university: '',
          qualification: 'B.Tech / B.E.',
          domain: 'Associate Software Developer',
          message: ''
        });
        setResumeFile(null);
      } else {
        setError(data.message || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      console.error('Career Submission Error:', err);
      setError('Failed to submit application. Please check your network connection or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    const matchesWorkMode = workModeFilter === 'All' || job.workMode === workModeFilter;
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesWorkMode && matchesSearch;
  });

  return (
    <section id="careers" className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 bg-transparent relative overflow-hidden min-h-[85vh]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb & Offer Verification Quick Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <button 
              onClick={handleBack}
              className="hover:text-blue-400 transition-colors flex items-center gap-1.5 font-semibold text-gray-300 hover:underline"
            >
              ← Home
            </button>
            <span>/</span>
            <span className="text-blue-400 font-bold">Careers & Opportunities</span>
          </div>

          <button
            onClick={() => setIsVerificationModalOpen(true)}
            className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Verify Offer Letter / Certificate ID</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <Briefcase size={14} /> Career Opportunities & Internships
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            Build Your Future With <span className="gradient-text">{COMPANY_NAME}</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Discover active job roles and internship tracks designed to elevate your technical craftsmanship with hands-on enterprise projects and senior mentorship.
          </p>
        </div>

        {/* View Switcher: Open Positions vs General Application */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveView('openings')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeView === 'openings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Briefcase size={16} /> Open Positions ({jobs.length})
            </button>
            <button
              onClick={() => setActiveView('generalApply')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeView === 'generalApply'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers size={16} /> General Candidate Profile
            </button>
          </div>
        </div>

        {/* ==========================================
            VIEW 1: OPEN JOB & INTERNSHIP POSITIONS
        ========================================== */}
        {activeView === 'openings' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search by role, skill, ID (e.g. FBT-01I)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500/60 transition-all"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <span className="text-[11px] text-gray-500 font-bold px-2 uppercase">Type:</span>
                {(['All', 'Job', 'Internship'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      typeFilter === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t === 'All' ? 'All Types' : t === 'Job' ? 'Full-Time Jobs' : 'Internships'}
                  </button>
                ))}
              </div>

              {/* Work Mode Filter */}
              <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <span className="text-[11px] text-gray-500 font-bold px-2 uppercase">Mode:</span>
                {(['All', 'Remote', 'Onsite', 'Hybrid'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setWorkModeFilter(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      workModeFilter === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Listing Grid */}
            {loadingJobs ? (
              <div className="text-center py-16 space-y-3">
                <Loader2 size={32} className="animate-spin text-blue-400 mx-auto" />
                <p className="text-xs text-gray-400">Loading open opportunities from MongoDB...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 text-gray-400 flex items-center justify-center mx-auto">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">No Positions Matching Filter</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  There are currently no active openings matching your criteria. You can submit a spontaneous profile using our general application form.
                </p>
                <button
                  onClick={() => setActiveView('generalApply')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
                >
                  Submit General Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <div 
                    key={job._id || job.jobId}
                    className="p-6 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                  >
                    {/* Top Badges & Clickable Title for Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          job.type === 'Internship' 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {job.type}
                        </span>
                        <span className="font-mono text-[11px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {job.jobId}
                        </span>
                      </div>

                      <h3 
                        onClick={() => handleOpenJobDetails(job)}
                        className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-snug cursor-pointer flex items-center justify-between"
                      >
                        <span>{job.title}</span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-blue-400" /> {job.workMode}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-emerald-400" /> {job.duration}
                        </span>
                      </div>

                      {job.location && (
                        <p className="text-[11px] text-gray-400 line-clamp-1">
                          📍 {job.location}
                        </p>
                      )}

                      <div 
                        onClick={() => handleOpenJobDetails(job)}
                        className="pt-2 cursor-pointer"
                      >
                        <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                          {(job.description || '').replace(/[#*`_]/g, '')}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenJobDetails(job)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition-all"
                      >
                        <ExternalLink size={13} className="text-blue-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleOpenJobApply(job)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all group-hover:scale-[1.02] active:scale-95"
                      >
                        <span>Apply Now</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            VIEW 2: GENERAL CANDIDATE PROFILE FORM
        ========================================== */}
        {activeView === 'generalApply' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-200">
            {/* Perks / Overview Side */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[2rem] glass border border-white/10 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Why Join FBT?</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  We empower talent through practical exposure, mentorship from industry veterans, and enterprise-grade software delivery.
                </p>

                <div className="space-y-4 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Modern Tech Stack</span>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">React, Node, Cloud Architectures, Python & AI systems.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Continuous Mentorship</span>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Direct guidance on real client projects and enterprise systems.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Verified Certifications</span>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Authentic Offer Letters & Internship Certifications with online validation IDs.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 text-center">
                <Code2 size={26} className="mx-auto text-blue-400 mb-2" />
                <h4 className="text-white font-bold text-base mb-1">Open To All Disciplines</h4>
                <p className="text-xs sm:text-sm text-gray-400">Fresh graduates, experienced professionals, and ambitious learners are encouraged to apply.</p>
              </div>
            </div>

            {/* General Form */}
            <div id="general-candidate-form" className="lg:col-span-8">
              <div className="p-8 md:p-12 rounded-[2rem] glass border border-white/10 relative">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-bold text-white">General Application Form</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Submit your profile to be considered for upcoming matching openings</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                    <Layers size={14} /> Open Talent Pool
                  </div>
                </div>

                {success ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle size={36} />
                    </div>
                    <h4 className="text-2xl font-bold text-white">Application Submitted!</h4>
                    <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                      Thank you for applying to Future Bound Tech. Our recruitment and technical mentors will review your application and reach out shortly.
                    </p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleGeneralSubmit}>
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            name="name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="Your Full Name"
                            value={formData.name}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="email" 
                            name="email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone, State, City */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="tel" 
                            name="phone"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          State <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            name="state"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="e.g. Andhra Pradesh"
                            value={formData.state}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          City <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            name="city"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="e.g. Nellore"
                            value={formData.city}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Institute & Qualification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Institute / University <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            name="institute_university"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                            placeholder="College / University Name"
                            value={formData.institute_university}
                            onChange={handleGeneralFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Highest Qualification <span className="text-red-400">*</span>
                        </label>
                        <select 
                          name="qualification"
                          className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all text-white"
                          value={formData.qualification}
                          onChange={handleGeneralFormChange}
                          required
                        >
                          {QUALIFICATIONS.map(q => (
                            <option key={q} value={q} className="bg-[#0f1422] text-white">
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Domain */}
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Preferred IT Domain <span className="text-red-400">*</span>
                      </label>
                      <select 
                        name="domain"
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all text-white"
                        value={formData.domain}
                        onChange={handleGeneralFormChange}
                        required
                      >
                        {CAREER_DOMAINS.map(d => (
                          <option key={d} value={d} className="bg-[#0f1422] text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Upload Resume (PDF, DOC, DOCX) <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="file" 
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleGeneralFileChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Submit Application
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <JobDetailModal
          job={selectedJobForDetails}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onApply={handleOpenJobApply}
        />

        <JobApplicationModal 
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={selectedJobForApply}
        />

        <OfferVerificationModal 
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
        />
      </div>
    </section>
  );
};

export default Careers;
