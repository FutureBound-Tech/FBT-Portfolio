import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Video, 
  Send, 
  CheckCircle, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Lock, 
  Coffee, 
  AlertCircle,
  Sun,
  Sunset,
  ChevronRight
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, CONTACT, ADMIN_EMAIL, COMPANY_NAME, CORPORATE_TIME_SLOTS, STATIC_MEET_LINK } from '../constants';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentMeetLink, setCurrentMeetLink] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotError, setSlotError] = useState('');
  
  // Separate Popup State for Time Slot
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [tempSelectedSlot, setTempSelectedSlot] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: todayStr,
    time: '',
    service: 'Software Development'
  });

  // Fetch booked slots from MongoDB whenever selected date changes
  useEffect(() => {
    if (isOpen && formData.date) {
      fetchBookedSlots(formData.date);
    }
  }, [isOpen, formData.date]);

  const fetchBookedSlots = async (selectedDate: string) => {
    try {
      const res = await fetch(`/api/appointments?date=${selectedDate}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.bookedSlots)) {
        setBookedSlots(data.bookedSlots);
      }
    } catch (err) {
      console.warn('Could not fetch booked slots:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setLoading(false);
      setCopied(false);
      setSlotError('');
      setIsSlotModalOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateMeetLink = () => {
    return 'https://meet.google.com/koi-medw-gni';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMeetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = `🚀 *Appointment Confirmed with ${COMPANY_NAME}*\n\n👤 *Client:* ${formData.name}\n🛠️ *Service:* ${formData.service}\n📅 *Date:* ${formData.date}\n⏰ *Time:* ${formData.time}\n\n🔗 *Meeting Link:* ${currentMeetLink}\n\nLooking forward to our session!`;
    window.open(`https://wa.me/${CONTACT.phone.replace(/\s/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenSlotModal = () => {
    setTempSelectedSlot(formData.time);
    setIsSlotModalOpen(true);
  };

  const handleConfirmSlotSelection = (slotLabel?: string) => {
    const chosen = slotLabel || tempSelectedSlot;
    if (chosen) {
      setFormData(prev => ({ ...prev, time: chosen }));
      setSlotError('');
    }
    setIsSlotModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError('');

    if (!formData.time) {
      setSlotError('Please choose a time slot by clicking the time selector.');
      return;
    }

    if (bookedSlots.includes(formData.time)) {
      setSlotError('This time slot is already booked for the selected date. Please choose another slot.');
      return;
    }

    setLoading(true);

    const meetLink = generateMeetLink();
    setCurrentMeetLink(meetLink);
    
    // 1. Save to MongoDB & check for collision
    try {
      const dbRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formData.name,
          client_email: formData.email,
          appointment_date: formData.date,
          appointment_time: formData.time,
          service_type: formData.service,
          meet_link: meetLink
        })
      });

      const dbData = await dbRes.json();
      if (!dbRes.ok || !dbData.success) {
        if (dbRes.status === 409) {
          setSlotError(`Time slot ${formData.time} was just booked. Please pick another available slot.`);
          fetchBookedSlots(formData.date);
          setLoading(false);
          return;
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB appointment save warning:', dbErr);
    }

    // 2. Send email notifications via EmailJS
    const templateParams = {
      to_name: 'Admin',
      from_name: formData.name,
      reply_to: formData.email,
      client_email: formData.email,
      client_name: formData.name,
      appointment_date: formData.date,
      appointment_time: formData.time,
      service_type: formData.service,
      meet_link: meetLink,
      company_name: COMPANY_NAME
    };

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.APPOINTMENT_TEMPLATE_ID,
        { ...templateParams, to_email: formData.email },
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.APPOINTMENT_TEMPLATE_ID,
        { ...templateParams, to_email: ADMIN_EMAIL, from_name: `NEW BOOKING: ${formData.name}` },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    } catch (emailErr: any) {
      console.warn('EmailJS Appointment notice:', emailErr);
    }

    setSuccess(true);
    setLoading(false);
  };

  const morningSlots = CORPORATE_TIME_SLOTS.filter(s => s.session === 'morning');
  const afternoonSlots = CORPORATE_TIME_SLOTS.filter(s => s.session === 'afternoon');

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
        
        <div className="relative w-full max-w-xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 max-h-[92vh] flex flex-col">
          {/* Top Branding Bar */}
          <div className="p-2 text-center bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient-x flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">FBT Corporate Booking Protocol</span>
              <Sparkles size={12} className="text-white animate-pulse" />
            </div>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto flex-1">
            {success ? (
              <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <CheckCircle size={36} className="animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white">Session <span className="gradient-text">Confirmed</span></h2>
                  <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">Your consultation slot is locked in MongoDB. A confirmation email has been dispatched.</p>
                </div>

                {/* Digital Ticket */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/30 text-white">F</div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-300">{COMPANY_NAME}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Booking ID</div>
                        <div className="text-[10px] font-mono text-blue-400 font-bold">FBT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-y-6 relative">
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Client Name</p>
                        <p className="text-base font-black text-white truncate">{formData.name}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Service Domain</p>
                        <p className="text-sm font-bold text-blue-400">{formData.service}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Consultation Date</p>
                        <p className="text-base font-bold text-white flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500" />{formData.date}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Corporate Time Slot</p>
                        <p className="text-base font-bold text-emerald-400 flex items-center justify-end gap-2">
                          <Clock size={14} className="text-emerald-500" />{formData.time}
                        </p>
                      </div>
                    </div>

                    <div className="mx-6 mb-6 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Virtual Meeting Room</span>
                        <Video size={16} className="text-blue-500" />
                      </div>
                      <div className="flex items-center gap-3 bg-black/80 p-3 rounded-xl border border-white/5">
                        <code className="text-[11px] font-mono text-blue-300 truncate flex-1 opacity-90">{currentMeetLink}</code>
                        <button 
                          onClick={handleCopy}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                          title="Copy Link"
                        >
                          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#25D366] text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                  >
                    <MessageSquare size={16} /> WhatsApp Sync
                  </button>
                  <button 
                    onClick={onClose}
                    className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white">Book <span className="gradient-text">Consultation</span></h2>
                    <p className="text-gray-400 text-xs mt-1">Corporate schedule: 9:00 AM – 6:00 PM (30 min duration, 1:00 PM – 2:00 PM Break)</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-400 hover:text-white">
                    <X size={22} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5">
                        <User size={12} className="text-blue-500" /> Full Name
                      </label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. John Doe"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/60 transition-all text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5">
                        <Mail size={12} className="text-blue-500" /> Email Address
                      </label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="e.g. john@example.com"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/60 transition-all text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Date & Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5">
                        <Calendar size={12} className="text-blue-500" /> Select Date
                      </label>
                      <input 
                        required
                        type="date" 
                        min={todayStr}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/60 transition-all text-white text-sm cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                        Service Architecture
                      </label>
                      <select 
                        value={formData.service}
                        onChange={(e) => setFormData({...formData, service: e.target.value})}
                        className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/60 transition-all text-white text-sm cursor-pointer"
                      >
                        <option className="bg-[#0f1422]" value="Software Development">Software Development</option>
                        <option className="bg-[#0f1422]" value="Mobile App Development">Mobile App Development</option>
                        <option className="bg-[#0f1422]" value="GST/IT Return Filing">GST/IT Return Filing</option>
                        <option className="bg-[#0f1422]" value="Insurance/LIC Consultancy">Insurance/LIC Consultancy</option>
                        <option className="bg-[#0f1422]" value="Career Consultation">Career Consultation</option>
                      </select>
                    </div>
                  </div>

                  {/* TIME SLOT BUTTON TRIGGER (Opens Separate Popup) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-500" /> Corporate Time Slot (30-Min Duration)
                      </label>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {bookedSlots.length > 0 ? `${bookedSlots.length} slot(s) booked on ${formData.date}` : 'All slots available'}
                      </span>
                    </div>

                    <div 
                      onClick={handleOpenSlotModal}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        formData.time 
                          ? 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                          : 'bg-white/[0.04] border-white/10 hover:border-blue-500/40 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          formData.time ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white/5 text-gray-400 group-hover:text-blue-400'
                        }`}>
                          <Clock size={18} />
                        </div>
                        <div>
                          {formData.time ? (
                            <>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{formData.time}</span>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Locked Slot ✓
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-400/80 mt-0.5">Click to change time slot</p>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-gray-300 font-semibold group-hover:text-white">Choose Time Slot...</span>
                              <p className="text-[11px] text-gray-500 mt-0.5">Click to view 2-column slots popup (9 AM – 6 PM)</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                        <span>{formData.time ? 'Change Slot' : 'Select Slot'}</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>

                  {slotError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={16} /> {slotError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || !formData.time}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={16} /> Confirm & Reserve {formData.time ? `(${formData.time})` : ''}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEPARATE POPUP MODAL FOR 2-COLUMN TIME SLOT SELECTION     */}
      {/* ========================================================= */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setIsSlotModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-[#090d18] border border-blue-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.35)] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-[#090d18] to-purple-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Select Consultation Time Slot</h3>
                  <p className="text-xs text-blue-400/90 mt-0.5 flex items-center gap-2 font-medium">
                    <span>📅 Date: <strong className="text-white">{formData.date}</strong></span>
                    <span>•</span>
                    <span>⏱️ Duration: 30 Mins</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSlotModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - 2 Columns of Slots */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>Select one available 30-minute corporate slot:</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Free</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Selected</span>
                </div>
              </div>

              {/* 2-COLUMN SLOTS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COLUMN 1: MORNING SESSION */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Sun size={14} /> Morning Session
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">09:00 AM – 01:00 PM</span>
                  </div>

                  <div className="space-y-2">
                    {morningSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.label) || bookedSlots.includes(slot.time);
                      const isSelected = tempSelectedSlot === slot.label;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setTempSelectedSlot(slot.label)}
                          className={`w-full p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            isBooked
                              ? 'bg-white/[0.01] border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-[1.01]'
                              : 'bg-white/[0.03] border-white/10 text-gray-200 hover:border-blue-500/50 hover:bg-blue-500/10'
                          }`}
                        >
                          <span className="font-mono text-xs font-bold">{slot.label}</span>
                          {isBooked ? (
                            <span className="text-[9px] text-red-400/90 font-bold uppercase flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                              <Lock size={10} /> Booked
                            </span>
                          ) : isSelected ? (
                            <span className="text-[9px] text-white font-bold uppercase flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                              <Check size={12} /> Selected
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Available
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: AFTERNOON SESSION */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Sunset size={14} /> Afternoon Session
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">02:00 PM – 06:00 PM</span>
                  </div>

                  <div className="space-y-2">
                    {afternoonSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.label) || bookedSlots.includes(slot.time);
                      const isSelected = tempSelectedSlot === slot.label;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setTempSelectedSlot(slot.label)}
                          className={`w-full p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            isBooked
                              ? 'bg-white/[0.01] border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-[1.01]'
                              : 'bg-white/[0.03] border-white/10 text-gray-200 hover:border-purple-500/50 hover:bg-purple-500/10'
                          }`}
                        >
                          <span className="font-mono text-xs font-bold">{slot.label}</span>
                          {isBooked ? (
                            <span className="text-[9px] text-red-400/90 font-bold uppercase flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                              <Lock size={10} /> Booked
                            </span>
                          ) : isSelected ? (
                            <span className="text-[9px] text-white font-bold uppercase flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                              <Check size={12} /> Selected
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Available
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recess Break Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                <Coffee size={14} /> 01:00 PM – 02:00 PM : Technical Recess & Lunch Break
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#070a12] flex items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                {tempSelectedSlot ? (
                  <span>Selected: <strong className="text-white font-mono">{tempSelectedSlot}</strong></span>
                ) : (
                  <span>No slot selected yet</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!tempSelectedSlot}
                  onClick={() => handleConfirmSlotSelection()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  Confirm Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentModal;
