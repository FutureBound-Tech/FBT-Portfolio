import React, { useState } from 'react';
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
  Code2
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { COMPANY_NAME, ADMIN_EMAIL, EMAILJS_CONFIG, CAREER_DOMAINS } from '../constants';

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

const Careers: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    institute_university: '',
    qualification: 'B.Tech / B.E.',
    domain: 'Full Stack Development',
    message: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const templateParams = {
      name: formData.name,
      from_name: formData.name,
      reply_to: formData.email,
      from_email: formData.email,
      phone: formData.phone,
      state: formData.state,
      city: formData.city,
      institute_university: formData.institute_university,
      qualification: formData.qualification,
      domain: formData.domain,
      course: formData.domain, // mapped to course for template compatibility
      message: formData.message || 'No additional note provided',
      subject: `New Career Application: ${formData.name} - ${formData.domain}`,
      company_name: COMPANY_NAME,
      resume_attached: resumeFile ? 'Yes (Check Admin Dashboard)' : 'No'
    };

    try {
      // 1. Save data directly into MongoDB
      try {
        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          submitData.append(key, String(value));
        });
        if (resumeFile) {
          submitData.append('resume', resumeFile);
        }

        await fetch('/api/careers', {
          method: 'POST',
          body: submitData
        });
      } catch (dbErr) {
        console.warn('MongoDB submission notice:', dbErr);
      }

      // 2. Dispatch EmailJS notification to Admin
      try {
        const templateId = EMAILJS_CONFIG.CAREER_TEMPLATE_ID || EMAILJS_CONFIG.CONTACT_TEMPLATE_ID;

        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          templateId,
          {
            ...templateParams,
            to_email: ADMIN_EMAIL,
            from_name: `CAREER: ${formData.name}`
          },
          EMAILJS_CONFIG.PUBLIC_KEY
        );

        // Send confirmation acknowledgment to Candidate
        try {
          await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            templateId,
            {
              ...templateParams,
              to_email: formData.email
            },
            EMAILJS_CONFIG.PUBLIC_KEY
          );
        } catch (clientErr) {
          console.warn('Candidate confirmation email skipped:', clientErr);
        }
      } catch (emailErr) {
        console.warn('EmailJS delivery notice:', emailErr);
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        state: '',
        city: '',
        institute_university: '',
        qualification: 'B.Tech / B.E.',
        domain: 'Full Stack Development',
        message: ''
      });
      setResumeFile(null);
    } catch (err: any) {
      console.error('EmailJS Career Submission Error:', err);
      setError('Failed to submit application. Please check your network connection or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="careers" className="pt-8 pb-12 px-6 bg-white/[0.02] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Career Opportunities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
            Build Your Future With <span className="gradient-text">{COMPANY_NAME}</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Join our high-impact team working at the convergence of next-generation technology and strategic finance. 
            Submit your profile to discover career and training paths tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
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
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Work with React, Next.js, Cloud Architectures, Python & AI systems.</p>
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
                    <span className="font-semibold text-white">Finance & Tech Synergies</span>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Gain cross-domain insights spanning fintech, taxation, and software engineering.</p>
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

          {/* Form Side */}
          <div className="lg:col-span-8">
            <div className="p-8 md:p-12 rounded-[2rem] glass border border-white/10 relative">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-white">Candidate Application Form</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Please provide your academic and professional preferences</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                  <Layers size={14} /> Easy Apply
                </div>
              </div>

              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Application Submitted!</h4>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you for applying to Future Bound Tech. Our recruitment and technical team will review your application and reach out shortly.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Row 1: Name & Email */}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Phone, State, City */}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          placeholder="e.g. Nellore / Kovur"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Institute & Highest Qualification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Institute / University of Education <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          name="institute_university"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500"
                          placeholder="e.g. JNTU / Andhra University / College Name"
                          value={formData.institute_university}
                          onChange={handleChange}
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
                        onChange={handleChange}
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

                  {/* Row 4: Domain Selection */}
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Select Domain You Are Interested In <span className="text-red-400">*</span>
                    </label>
                    <select 
                      name="domain"
                      className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all text-white"
                      value={formData.domain}
                      onChange={handleChange}
                      required
                    >
                      {CAREER_DOMAINS.map(d => (
                        <option key={d} value={d} className="bg-[#0f1422] text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 5: Message / Additional Notes */}
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Additional Message / Key Skills / Portfolio Link (Optional)
                    </label>
                    <textarea 
                      rows={3}
                      name="message"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white placeholder-gray-500 resize-none"
                      placeholder="Share links to your GitHub / LinkedIn / Portfolio or tell us about your experience..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Row 6: Resume Upload */}
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Upload Resume (PDF, DOC, DOCX) <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="file" 
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white/[0.07] outline-none transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
