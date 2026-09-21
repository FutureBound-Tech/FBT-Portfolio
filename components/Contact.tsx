
import React, { useState } from 'react';
import { CONTACT, COMPANY_NAME, EMAILJS_CONFIG, ADMIN_EMAIL } from '../constants';
import { Phone, Mail, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'software',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      company_name: COMPANY_NAME
    };

    try {
      // 1. Save contact message into MongoDB
      try {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          })
        });
      } catch (dbErr) {
        console.warn('MongoDB contact notice:', dbErr);
      }

      // 2. Send email via EmailJS
      try {
        // Send to Client (acknowledgment)
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
          { ...templateParams, to_email: formData.email },
          EMAILJS_CONFIG.PUBLIC_KEY
        );

        // Send notification to Admin
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
          { ...templateParams, to_email: ADMIN_EMAIL, from_name: `CONTACT: ${formData.name}` },
          EMAILJS_CONFIG.PUBLIC_KEY
        );
      } catch (emailErr) {
        console.warn('EmailJS delivery notice:', emailErr);
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: 'software', message: '' });
    } catch (err: any) {
      console.error('EmailJS Error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="contact" className="pt-6 pb-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">Let's Build <br /><span className="text-blue-500">Something New.</span></h2>
            <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-md leading-relaxed">
              Whether you need a full-scale mobile application or assistance with GST filing, our team is ready to accelerate your journey.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="p-3.5 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-base">Phone</h4>
                  <p className="text-gray-400 text-sm mt-0.5">+91 {CONTACT.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-3.5 rounded-2xl bg-purple-600/10 text-purple-500 border border-purple-500/20 shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-base">Email</h4>
                  <p className="text-gray-400 text-sm mt-0.5">{CONTACT.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-3.5 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-base">Address</h4>
                  <p className="text-gray-400 text-sm mt-0.5">{CONTACT.address}, {CONTACT.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            <div className="p-8 md:p-12 rounded-[2rem] glass relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-white">Send a Message</h3>
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-gray-400 mb-6 text-sm">We'll get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">Name <span className="text-red-400">*</span></label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-blue-500 outline-none transition-colors text-white placeholder-gray-500"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">Email <span className="text-red-400">*</span></label>
                    <input 
                      type="email" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-blue-500 outline-none transition-colors text-white placeholder-gray-500"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">Subject <span className="text-red-400">*</span></label>
                  <select 
                    className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-blue-500 outline-none transition-colors text-white appearance-none"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option className="bg-[#0f1422] text-white" value="software">Software Development</option>
                    <option className="bg-[#0f1422] text-white" value="finance">Financial Services</option>
                    <option className="bg-[#0f1422] text-white" value="other">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">Message <span className="text-red-400">*</span></label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-blue-500 outline-none transition-colors text-white placeholder-gray-500 resize-none"
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                <div>
                  <button 
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Inquiry
                      </>
                    )}
                  </button>
                </div>
                </form>
              )}
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -z-0"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
