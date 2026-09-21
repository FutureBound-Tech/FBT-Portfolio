import 'dotenv/config';
import nodemailer from 'nodemailer';

// SMTP Configuration
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// OpenRouter & Groq API Keys
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export const STATIC_MEET_LINK = 'https://meet.google.com/koi-medw-gni';

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

/**
 * Dual-Engine AI Response Generator
 * Attempts OpenRouter first; if unreachable, falls back to Groq; if both fail, uses fallback.
 */
export async function generateAIContent(prompt, systemInstruction = 'You are an executive AI assistant at Future Bound Tech.') {
  // Engine 1: OpenRouter
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400
      })
    });
    const data = await res.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('🤖 AI Content generated via OpenRouter');
      return data.choices[0].message.content.trim();
    }
  } catch (orErr) {
    console.warn('⚠️ OpenRouter error, switching to Groq failover:', orErr.message);
  }

  // Engine 2: Groq (Failover)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400
      })
    });
    const data = await res.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('⚡ AI Content generated via Groq failover');
      return data.choices[0].message.content.trim();
    }
  } catch (groqErr) {
    console.warn('⚠️ Groq failover error:', groqErr.message);
  }

  return null;
}

/**
 * Send Email helper
 */
export async function sendEmail({ to, subject, html, replyTo }) {
  try {
    const info = await transporter.sendMail({
      from: `"Future Bound Tech" <${SMTP_USER}>`,
      to,
      replyTo: replyTo || SMTP_USER,
      subject,
      html
    });
    console.log(`📧 Email sent successfully to ${to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP Sending Error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 1. ADMIN LOGIN ACTIVITY NOTIFICATION
// ==========================================
export async function sendAdminLoginNotification(clientInfo = {}) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 16px 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">🔐 Admin Portal Login Alert</h2>
      </div>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A successful login to the <strong>Future Bound Tech Admin Portal (/admin-mb)</strong> was just recorded.
      </p>
      <div style="background: #111827; padding: 15px; border-radius: 8px; border: 1px solid #374151; font-size: 13px; color: #e2e8f0;">
        <p style="margin: 5px 0;">⏰ <strong>Timestamp:</strong> ${timestamp} (IST)</p>
        <p style="margin: 5px 0;">🌐 <strong>Client IP:</strong> ${clientInfo.ip || 'Local / Network'}</p>
        <p style="margin: 5px 0;">💻 <strong>User Agent:</strong> ${clientInfo.userAgent || 'Web Browser'}</p>
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 20px; text-align: center;">
        Security Automated Notification • Future Bound Tech
      </p>
    </div>
  `;

  return sendEmail({
    to: SMTP_USER,
    subject: `🔐 Security Alert: Admin Login on FBT Portal (${timestamp})`,
    html
  });
}

// ==========================================
// 2. CAREER APPLICATION EMAIL FLOW
// ==========================================
export async function handleCareerEmails(appData) {
  const { name, email, phone, state, city, institute_university, qualification, domain, message } = appData;

  // AI-generated personalized candidate message
  const aiPrompt = `Write a professional, welcoming acknowledgment message (3-4 concise paragraphs) to a student/candidate named "${name}" who just applied for the "${domain}" path with educational background in "${qualification}" from "${institute_university}". Emphasize that Future Bound Tech is thrilled to review their profile, will schedule a technical interaction soon, and supports their career ambition. Keep tone inspiring, warm, and corporate.`;
  
  const aiMessage = await generateAIContent(aiPrompt) || 
    `Thank you for taking the first step towards an exciting journey with Future Bound Tech. We have received your application for the ${domain} track. Our recruitment team and technical mentors are reviewing your profile and will be in touch with you shortly.`;

  // 1. Email to Candidate
  const candidateHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 20px;">Future Bound Tech</h2>
        <p style="margin: 5px 0 0 0; color: #dbeafe; font-size: 13px;">Application Received • ${domain}</p>
      </div>

      <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        Dear <strong style="color: #60a5fa;">${name}</strong>,<br /><br />
        ${aiMessage.replace(/\n/g, '<br />')}
      </div>

      <div style="background: #111827; padding: 15px; border-radius: 10px; border: 1px solid #374151; font-size: 13px;">
        <h4 style="margin: 0 0 10px 0; color: #38bdf8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Your Submitted Profile Summary</h4>
        <p style="margin: 4px 0; color: #94a3b8;">🎓 <strong>Qualification:</strong> <span style="color: #fff;">${qualification || 'N/A'}</span></p>
        <p style="margin: 4px 0; color: #94a3b8;">🏛️ <strong>Institute:</strong> <span style="color: #fff;">${institute_university || 'N/A'}</span></p>
        <p style="margin: 4px 0; color: #94a3b8;">💻 <strong>Selected Domain:</strong> <span style="color: #34d399; font-weight: bold;">${domain}</span></p>
        <p style="margin: 4px 0; color: #94a3b8;">📍 <strong>Location:</strong> <span style="color: #fff;">${city ? `${city}, ${state}` : state || 'India'}</span></p>
      </div>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; line-height: 1.5;">
        If you have any questions, feel free to reply directly to this email or connect with us on WhatsApp.
      </p>
      <div style="border-top: 1px solid #1f293d; margin-top: 20px; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b;">
        Future Bound Tech • Innovation & Finance Systems • Kovur, Andhra Pradesh
      </div>
    </div>
  `;

  // 2. Email to Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 18px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">💼 New Candidate Career Submission</h2>
      </div>
      <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
        <tr><td style="padding: 6px 0; width: 140px; color: #94a3b8;">👤 Candidate:</td><td style="color: #fff; font-weight: bold;">${name}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">✉️ Email:</td><td><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">📞 Phone:</td><td style="color: #fff;">${phone}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">📍 Location:</td><td style="color: #fff;">${city ? `${city}, ${state}` : state}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">🎓 Qualification:</td><td style="color: #fff;">${qualification}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">🏛️ University:</td><td style="color: #fff;">${institute_university}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">💻 IT Domain:</td><td style="color: #34d399; font-weight: bold;">${domain}</td></tr>
      </table>
      ${message ? `<div style="margin-top: 15px; padding: 12px; background: #111827; border-radius: 8px; font-size: 13px; color: #e2e8f0;"><strong>Notes / Portfolio:</strong><br />${message}</div>` : ''}
      <div style="margin-top: 20px; text-align: center;">
        <a href="http://localhost:3000/admin-mb" style="background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold;">Open in Admin Portal</a>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: email, subject: `Thank You for Applying to Future Bound Tech (${domain})`, html: candidateHtml }),
    sendEmail({ to: SMTP_USER, subject: `🚀 New Career Applicant: ${name} (${domain})`, html: adminHtml, replyTo: email })
  ]);
}

// ==========================================
// 3. APPOINTMENT BOOKING EMAIL FLOW
// ==========================================
export async function handleAppointmentEmails(bookingData) {
  const { client_name, client_email, appointment_date, appointment_time, service_type, meet_link } = bookingData;
  const activeMeetLink = meet_link || STATIC_MEET_LINK;

  const aiPrompt = `Generate a polite, executive consultation confirmation message (2-3 short paragraphs) to "${client_name}" confirming their appointment for "${service_type}" on "${appointment_date}" at "${appointment_time}". Mention that the Google Meet room is pre-configured and our senior technical/financial consultants will join at the scheduled time.`;

  const aiMessage = await generateAIContent(aiPrompt) ||
    `We are delighted to confirm your consultation session with Future Bound Tech for ${service_type}. Our specialists are prepared to dive into your requirements and provide tailored strategic solutions.`;

  // 1. Email to Client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 20px;">Consultation Confirmed</h2>
        <p style="margin: 5px 0 0 0; color: #d1fae5; font-size: 13px;">Future Bound Tech Session Protocol</p>
      </div>

      <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        Dear <strong style="color: #60a5fa;">${client_name}</strong>,<br /><br />
        ${aiMessage.replace(/\n/g, '<br />')}
      </div>

      <div style="background: #111827; padding: 18px; border-radius: 12px; border: 1px solid #374151; font-size: 13px;">
        <p style="margin: 5px 0;">🛠️ <strong>Domain / Service:</strong> <span style="color: #fff; font-weight: bold;">${service_type}</span></p>
        <p style="margin: 5px 0;">📅 <strong>Date:</strong> <span style="color: #60a5fa; font-weight: bold;">${appointment_date}</span></p>
        <p style="margin: 5px 0;">⏰ <strong>Time Slot:</strong> <span style="color: #34d399; font-weight: bold;">${appointment_time}</span></p>
        
        <div style="margin-top: 15px; padding: 12px; background: #064e3b; border-radius: 8px; border: 1px solid #059669;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #a7f3d0; display: block; margin-bottom: 4px;">📹 Google Meet Room Link:</span>
          <a href="${activeMeetLink}" target="_blank" style="color: #ffffff; font-family: monospace; font-size: 13px; text-decoration: underline; word-break: break-all;">
            ${activeMeetLink}
          </a>
        </div>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; text-align: center;">
        Please join the Google Meet room 2-3 minutes prior to your time slot.
      </p>
    </div>
  `;

  // 2. Email to Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 18px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">📅 New Consultation Booking Reserved</h2>
      </div>
      <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
        <tr><td style="padding: 6px 0; width: 140px; color: #94a3b8;">👤 Client:</td><td style="color: #fff; font-weight: bold;">${client_name}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">✉️ Email:</td><td><a href="mailto:${client_email}" style="color: #60a5fa;">${client_email}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">📅 Date:</td><td style="color: #60a5fa; font-weight: bold;">${appointment_date}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">⏰ Slot:</td><td style="color: #34d399; font-weight: bold;">${appointment_time}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">🛠️ Service:</td><td style="color: #fff;">${service_type}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">📹 Meet Link:</td><td><a href="${activeMeetLink}" target="_blank" style="color: #38bdf8;">${activeMeetLink}</a></td></tr>
      </table>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: client_email, subject: `Confirmed: Consultation with Future Bound Tech on ${appointment_date} (${appointment_time})`, html: clientHtml }),
    sendEmail({ to: SMTP_USER, subject: `📅 New Booking: ${client_name} - ${appointment_date} (${appointment_time})`, html: adminHtml, replyTo: client_email })
  ]);
}

// ==========================================
// 4. CONTACT INQUIRY EMAIL FLOW
// ==========================================
export async function handleContactEmails(contactData) {
  const { name, email, subject, message } = contactData;

  const aiPrompt = `Write a polite, reassuring response message (2 paragraphs) to "${name}" who submitted a contact inquiry regarding "${subject}". Acknowledge their requirement ("${message}") and state that a Future Bound Tech representative will contact them with detailed consultation within 24 hours.`;

  const aiMessage = await generateAIContent(aiPrompt) ||
    `Thank you for reaching out to Future Bound Tech regarding "${subject}". We have received your message and our team is already reviewing your requirement. An expert advisor will get back to you shortly.`;

  // 1. To Client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 18px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">Thank You For Contacting Us</h2>
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        Dear <strong style="color: #60a5fa;">${name}</strong>,<br /><br />
        ${aiMessage.replace(/\n/g, '<br />')}
      </div>
      <div style="background: #111827; padding: 12px 15px; border-radius: 8px; font-size: 12px; color: #94a3b8; border: 1px solid #374151;">
        <strong>Your Message:</strong><br />
        <span style="color: #e2e8f0;">${message}</span>
      </div>
    </div>
  `;

  // 2. To Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #7c3aed, #6366f1); padding: 18px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">✉️ New Contact Inquiry: ${subject}</h2>
      </div>
      <p style="font-size: 13px; color: #cbd5e1; margin: 5px 0;"><strong>From:</strong> ${name} (<a href="mailto:${email}" style="color: #60a5fa;">${email}</a>)</p>
      <div style="margin-top: 15px; padding: 15px; background: #111827; border-radius: 8px; font-size: 13px; color: #e2e8f0; border: 1px solid #374151;">
        ${message}
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: email, subject: `We received your inquiry: ${subject} • Future Bound Tech`, html: clientHtml }),
    sendEmail({ to: SMTP_USER, subject: `💬 Contact Lead: ${name} - ${subject}`, html: adminHtml, replyTo: email })
  ]);
}
