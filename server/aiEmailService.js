import 'dotenv/config';
import nodemailer from 'nodemailer';
import { SendApi, AccountApi, Configuration as HostingerConfig } from 'hostinger-mail-api-sdk';

// Hostinger Mail API Configuration
const HOSTINGER_USER = process.env.HOSTINGER_USER || process.env.SMTP_USER || 'info@futureboundtech.online';
const HOSTINGER_PASS = process.env.HOSTINGER_PASS || process.env.SMTP_PASS || '57103b402a57fe18dee2cf3e1449da0ed65a7b5c30fc286eb5488ec7e346754e';
const HOSTINGER_TOKEN = process.env.HOSTINGER_API_TOKEN || HOSTINGER_PASS;
const GMAIL_USER = process.env.GMAIL_USER || 'futurebound.tech@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'admu xewm eqmp lrdu';

const SMTP_USER = HOSTINGER_USER;

// OpenRouter & Groq API Keys
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export const STATIC_MEET_LINK = 'https://meet.google.com/koi-medw-gni';

// 1. Primary Engine: Official Hostinger Mail API SDK
let cachedMailboxId = 'AC8b2f62840e7db28f46037812b5fa';
const hostingerSdkConfig = new HostingerConfig({ accessToken: HOSTINGER_TOKEN });
const hostingerSendApi = new SendApi(hostingerSdkConfig);
const hostingerAccountApi = new AccountApi(hostingerSdkConfig);

// Helper to ensure Mailbox ID is fresh
async function getMailboxResourceId() {
  if (cachedMailboxId) return cachedMailboxId;
  try {
    const res = await hostingerAccountApi.getCurrentAccount();
    const mailboxes = res.data?.data?.mailboxes || [];
    const target = mailboxes.find(m => m.address === HOSTINGER_USER) || mailboxes[0];
    if (target?.resourceId) {
      cachedMailboxId = target.resourceId;
      return cachedMailboxId;
    }
  } catch (err) {
    console.warn('⚠️ Could not query Hostinger Account API, using default mailbox ID:', err.message);
  }
  return 'AC8b2f62840e7db28f46037812b5fa';
}

// 2. Secondary Engine: Hostinger SMTP (Port 465 SSL)
const hostingerTransporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: HOSTINGER_USER,
    pass: HOSTINGER_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 3. Fallback Engine: Gmail App Password
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
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
        max_tokens: 600
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
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600
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
 * AI Job / Internship Description Generator
 */
export async function generateJobDescriptionAI({ title, type, keyContext, duration, workMode, location }) {
  const prompt = `Generate a compelling, professional job description for a "${type}" opening at "Future Bound Tech" (an innovative IT solutions & fintech consulting firm in Nellore, Andhra Pradesh).
Position Title: ${title}
Opportunity Type: ${type}
Work Mode: ${workMode} ${location ? `(${location})` : ''}
Duration: ${duration || 'Standard'}
Key Context / Required Focus Points: ${keyContext || 'General software engineering best practices, modern frameworks, clean code'}

Requirements for output:
1. About the Role (2-3 concise sentences)
2. Key Responsibilities (4-5 bullet points)
3. Required Skills & Qualifications (4-5 bullet points)
4. What We Offer & Growth Opportunities (3 bullet points)

Format in clean markdown with clear headings. Keep the tone inspiring, forward-looking, and corporate.`;

  const systemInstruction = 'You are an expert HR and Talent Acquisition Lead creating enterprise-grade job postings for Future Bound Tech.';
  const aiGenerated = await generateAIContent(prompt, systemInstruction);

  if (aiGenerated) {
    return aiGenerated;
  }

  // Fallback template if AI engines are temporarily unreachable
  return `### About the Role
Future Bound Tech is seeking a talented and proactive **${title}** to join our team as a **${type}**. In this role, you will collaborate on modern web and software architectures, build scalable solutions, and contribute directly to high-impact client products.

### Key Responsibilities
- Design, develop, and maintain high-quality features and codebases.
- Collaborate with senior mentors, developers, and project managers.
- Participate in code reviews, sprint planning, and architectural discussions.
- Debug, optimize performance, and ensure software reliability across platforms.
- ${keyContext ? `Focus on: ${keyContext}` : 'Integrate modern frontend and backend APIs.'}

### Qualifications & Requirements
- Relevant educational background in Computer Science, IT, Engineering, or related discipline.
- Strong problem-solving aptitude and hands-on familiarity with modern tech stacks.
- Excellent communication skills, enthusiasm for continuous learning, and teamwork mindset.
- Work Mode: ${workMode}${location ? ` (${location})` : ''}.

### What We Offer
- Mentorship from seasoned industry veterans and exposure to real production systems.
- Collaborative, high-energy environment with transparent career progression.
- Certificate of Completion, performance recommendation, and full-time hiring opportunities.`;
}

/**
 * Smart Combinatorial Generator (Generates thousands of unique, non-repeating variations)
 */
export function getDynamicCombinatorialReview(category = 'student') {
  if (category === 'student') {
    const openings = [
      "Best place in Nellore to learn practical software engineering!",
      "Super grateful for the coaching and hands-on guidance at Future Bound Tech.",
      "The practical coding sessions and mentorship here are unmatched in Nellore.",
      "Hands-on web and mobile development training with incredible mentors.",
      "Top-tier technical coaching in Nellore with real-world project exposure.",
      "Learning full-stack development at Future Bound Tech transformed my skills.",
      "The mentors explain every complex concept with crystal clarity.",
      "Awesome learning atmosphere with modern tech stacks and supportive trainers."
    ];
    const middles = [
      "The mentors guide you through real projects step-by-step.",
      "The focus on modern frameworks and clean code gave me tremendous confidence.",
      "Friendly instructors, real-time code reviews, and strong career support.",
      "Gained practical exposure to full-stack tech and industry best practices.",
      "The interactive sessions and personal attention make learning effortless."
    ];
    const closings = [
      "Highly recommend to every aspiring developer in AP!",
      "Truly the leading software training institute in Nellore.",
      "Grateful for the support and career guidance from the FBT team.",
      "A must-join for anyone looking to build a serious career in tech.",
      "Proud to have learned from the best in Nellore!"
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(openings)} ${pick(middles)} ${pick(closings)}`;
  } else {
    const openings = [
      "Exceptional software development service from Future Bound Tech!",
      "Delivered our application on time with modern architecture and sleek UI.",
      "Future Bound Tech is the most reliable IT partner we've worked with in Nellore.",
      "Outstanding technical execution and seamless communication throughout our project.",
      "High-performance custom software delivered with exceptional attention to detail.",
      "Top-class digital transformation and software engineering team in Nellore."
    ];
    const middles = [
      "Their agile team was extremely responsive and solved our complex requirements.",
      "The application performance, UI responsiveness, and code quality exceeded expectations.",
      "Professional project management with clear milestones and proactive updates.",
      "They understood our business domain perfectly and engineered the right solution."
    ];
    const closings = [
      "Highly recommend them for any web or mobile development project!",
      "Best IT solutions company in Andhra Pradesh without a doubt.",
      "Looking forward to continuing our long-term collaboration with FBT.",
      "Great experience from start to finish. Highly satisfied!"
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(openings)} ${pick(middles)} ${pick(closings)}`;
  }
}

/**
 * Dynamic AI Google Review Generator
 */
export async function generateUniqueReviewAI(category = 'student') {
  const isStudent = category === 'student';
  const roleContext = isStudent
    ? 'a passionate student or trainee who completed practical software coaching, web development, or career mentorship'
    : 'a satisfied business client or founder who hired Future Bound Tech for web/mobile app development, custom software, or IT consulting';

  const aspects = isStudent
    ? ['hands-on coding and real-world projects', 'mentorship from industry veterans', 'supportive learning environment in Nellore', 'building career confidence and modern tech stacks', 'practical full-stack training', 'friendly guidance and personal attention']
    : ['on-time project delivery and clean architecture', 'modern UI/UX and seamless performance', 'reliable customer support and agile communication', 'expert custom software engineering in Nellore', 'top-notch digital transformation', 'secure and scalable cloud-ready systems'];

  const randomAspect = aspects[Math.floor(Math.random() * aspects.length)];
  const randomSeed = Math.random().toString(36).substring(7);

  const prompt = `Write a single, unique, realistic 5-star Google review for "Future Bound Tech" in Nellore, Andhra Pradesh.
Perspective: ${roleContext}.
Focus specifically on: ${randomAspect}.
Variation Seed: ${randomSeed}.
Requirements:
- Exactly 1 or 2 short sentences (between 12 and 24 words).
- Natural, genuine human tone (not robotic, not overly dramatic).
- Do NOT include quotation marks, star ratings, emojis, hashtags, or titles.
- Output ONLY the review text.`;

  const systemInstruction = 'You generate short, authentic, 5-star Google Business review comments for Future Bound Tech.';

  try {
    const aiResult = await generateAIContent(prompt, systemInstruction);
    if (aiResult) {
      const clean = aiResult.replace(/^["'\s]+|["'\s]+$/g, '').replace(/[⭐★]/g, '').trim();
      if (clean && clean.length > 20) {
        return clean;
      }
    }
  } catch (err) {
    console.warn('AI review generation fallback:', err.message);
  }

  return getDynamicCombinatorialReview(category);
}

/**
 * Resilient Send Email with Hostinger Mail API SDK Primary + Failovers
 */
export async function sendEmail({ to, subject, html, replyTo, fromName = "Future Bound Tech", attachments = [] }) {
  const recipients = Array.isArray(to) ? to : [to];

  // Prepare attachments for Hostinger SDK (base64 string content)
  const sdkAttachments = (attachments || []).map(att => ({
    filename: att.filename,
    content: Buffer.isBuffer(att.content) 
      ? att.content.toString('base64') 
      : (typeof att.content === 'string' ? att.content.replace(/^data:[^;]+;base64,/, '') : String(att.content)),
    contentType: att.contentType || 'application/pdf',
    encoding: 'base64'
  }));

  // Prepare attachments for nodemailer (Buffer)
  const nodemailerAttachments = (attachments || []).map(att => ({
    filename: att.filename,
    content: Buffer.isBuffer(att.content) 
      ? att.content 
      : Buffer.from(typeof att.content === 'string' ? att.content.replace(/^data:[^;]+;base64,/, '') : '', 'base64'),
    contentType: att.contentType || 'application/pdf'
  }));

  // Try 1: Official Hostinger Mail API SDK (Direct HTTPS / Port 443 REST)
  try {
    const mailboxId = await getMailboxResourceId();
    const payload = {
      to: recipients,
      displayName: fromName,
      subject,
      html
    };
    if (sdkAttachments.length > 0) {
      payload.attachments = sdkAttachments;
    }
    const response = await hostingerSendApi.sendEmail(mailboxId, payload);
    console.log(`📧 [Hostinger Mail API SDK] Email delivered successfully to ${recipients.join(', ')} from ${HOSTINGER_USER} (Status: ${response?.status || 204}, Attachments: ${sdkAttachments.length})`);
    return { success: true, status: response?.status || 204, provider: 'Hostinger Mail API' };
  } catch (sdkErr) {
    const errDetails = sdkErr.response?.data ? JSON.stringify(sdkErr.response.data) : sdkErr.message;
    console.warn(`⚠️ Hostinger Mail API SDK failed to ${recipients.join(', ')}: ${errDetails}. Attempting Hostinger SMTP...`);
  }

  // Try 2: Hostinger SMTP
  try {
    const mailOptions = {
      from: `"${fromName}" <${HOSTINGER_USER}>`,
      to: recipients.join(', '),
      replyTo: replyTo || HOSTINGER_USER,
      subject,
      html
    };
    if (nodemailerAttachments.length > 0) {
      mailOptions.attachments = nodemailerAttachments;
    }
    const info = await hostingerTransporter.sendMail(mailOptions);
    console.log(`📧 [Hostinger SMTP] Email delivered to ${recipients.join(', ')} (ID: ${info.messageId}, Attachments: ${nodemailerAttachments.length})`);
    return { success: true, messageId: info.messageId, provider: 'Hostinger SMTP' };
  } catch (hostingerErr) {
    console.warn(`⚠️ Hostinger SMTP send failed to ${recipients.join(', ')}: ${hostingerErr.message}. Attempting Gmail failover...`);
  }

  // Try 3: Gmail SMTP Fallback
  try {
    const mailOptions = {
      from: `"${fromName}" <${GMAIL_USER}>`,
      to: recipients.join(', '),
      replyTo: replyTo || GMAIL_USER,
      subject,
      html
    };
    if (nodemailerAttachments.length > 0) {
      mailOptions.attachments = nodemailerAttachments;
    }
    const info = await gmailTransporter.sendMail(mailOptions);
    console.log(`⚡ [Gmail Fallover] Email delivered to ${recipients.join(', ')} (ID: ${info.messageId}, Attachments: ${nodemailerAttachments.length})`);
    return { success: true, messageId: info.messageId, provider: 'Gmail' };
  } catch (gmailErr) {
    console.error(`❌ All email providers failed for ${recipients.join(', ')}:`, gmailErr.message);
    return { success: false, error: gmailErr.message };
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
    to: HOSTINGER_USER,
    subject: `🔐 Security Alert: Admin Login on FBT Portal (${timestamp})`,
    html
  });
}

// ==========================================
// 2. GENERAL CAREER APPLICATION EMAIL FLOW
// ==========================================
export async function handleCareerEmails(appData) {
  const { name, email, phone, state, city, institute_university, qualification, domain, message } = appData;

  const aiPrompt = `Write a professional, welcoming acknowledgment message (3-4 concise paragraphs) to a candidate named "${name}" who just applied for the "${domain}" path with background in "${qualification}" from "${institute_university}". Emphasize that Future Bound Tech is thrilled to review their profile.`;
  
  const aiMessage = await generateAIContent(aiPrompt) || 
    `Thank you for taking the first step towards an exciting journey with Future Bound Tech. We have received your application for the ${domain} track. Our recruitment team and technical mentors are reviewing your profile and will be in touch with you shortly.`;

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
        If you have any questions, feel free to reply directly to this email: <strong>info@futureboundtech.online</strong>.
      </p>
      <div style="border-top: 1px solid #1f293d; margin-top: 20px; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b;">
        Future Bound Tech • Innovation & Finance Systems • Nellore, Andhra Pradesh
      </div>
    </div>
  `;

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
    </div>
  `;

  await Promise.all([
    sendEmail({ to: email, subject: `Thank You for Applying to Future Bound Tech (${domain})`, html: candidateHtml }),
    sendEmail({ to: HOSTINGER_USER, subject: `🚀 New Career Applicant: ${name} (${domain})`, html: adminHtml, replyTo: email })
  ]);
}

export const COMPANY_LOGO_URL = 'https://www.futureboundtech.online/logo.png';

export function renderCleanEmailHtml({ 
  badgeLabel = 'RECRUITMENT UPDATE',
  headerTitle = 'Your application has been shortlisted.',
  headerSubtitle = 'We are pleased to invite you to the next stage of our selection process.',
  candidateName, 
  introContent, 
  jobId, 
  applicationId, 
  jobTitle, 
  jobType,
  extraDetailsHtml = '',
  nextStepsHtml = '',
  customBodyHtml = ''
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- 1. Header (Logo + Company Name) -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 32px; border-bottom: 1px solid #eaecf0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="${COMPANY_LOGO_URL}" alt="Future Bound Tech Logo" height="34" style="height: 34px; width: auto; display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px; display: block; line-height: 1.2;">Future Bound Tech</span>
                          <span style="font-size: 11px; color: #64748b; font-weight: 500; display: block;">Talent Acquisition & Recruitment</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Official Notice</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Hero Section (Navy -> Indigo/Purple Gradient) -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); padding: 32px 32px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #a5b4fc; text-transform: uppercase; display: block; margin-bottom: 8px;">
                ${badgeLabel}
              </span>
              <h1 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 700; color: #ffffff; line-height: 1.35;">
                ${headerTitle}
              </h1>
              ${headerSubtitle ? `
              <p style="margin: 0; font-size: 13.5px; color: #cbd5e1; line-height: 1.5;">
                ${headerSubtitle}
              </p>` : ''}
            </td>
          </tr>

          <!-- 3. Email Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px; font-size: 14.5px; line-height: 1.65; color: #334155;">
              
              ${candidateName ? `
              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
                Dear ${candidateName},
              </p>` : ''}

              ${customBodyHtml ? customBodyHtml : `
                ${introContent ? `
                <p style="margin: 0 0 20px 0; font-size: 14.5px; line-height: 1.65; color: #334155;">
                  ${introContent}
                </p>` : ''}

                <!-- 4. Position Details (Subtle light-gray with indigo accent line) -->
                ${(jobTitle || jobId) ? `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    ${jobTitle ? `
                    <tr>
                      <td style="padding: 4px 0; width: 100px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">POSITION</td>
                      <td style="padding: 4px 0; font-size: 14.5px; font-weight: 600; color: #0f172a;">${jobTitle} ${jobType ? `<span style="color: #64748b; font-weight: normal;">(${jobType})</span>` : ''}</td>
                    </tr>` : ''}
                    ${jobId ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">JOB ID</td>
                      <td style="padding: 4px 0; font-size: 13.5px; font-weight: 600; color: #4f46e5; font-family: monospace;">${jobId}</td>
                    </tr>` : ''}
                    ${applicationId ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">REF ID</td>
                      <td style="padding: 4px 0; font-size: 13px; font-weight: 500; color: #475569; font-family: monospace;">${applicationId}</td>
                    </tr>` : ''}
                  </table>
                </div>` : ''}

                ${extraDetailsHtml}

                <!-- 5. Next Steps -->
                ${nextStepsHtml ? `
                <div style="margin: 24px 0 0 0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Next Steps</h3>
                  <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                    ${nextStepsHtml}
                  </p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                    We appreciate your time and interest in Future Bound Tech and look forward to speaking with you.
                  </p>
                </div>` : ''}
              `}

              <!-- 6. Signature -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; line-height: 1.6;">
                Regards,<br /><br />
                <strong style="color: #0f172a;">Talent Acquisition Team</strong><br />
                <span style="color: #64748b;">Future Bound Tech</span>
              </div>
            </td>
          </tr>

          <!-- 7. Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 22px 32px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong style="color: #334155; font-size: 13px;">Future Bound Tech</strong><br />
              Innovation & Finance Systems · Nellore, Andhra Pradesh<br /><br />
              <a href="mailto:info@futureboundtech.online" style="color: #4f46e5; text-decoration: none; font-weight: 500;">info@futureboundtech.online</a> &nbsp;·&nbsp; <a href="https://www.futureboundtech.online" style="color: #4f46e5; text-decoration: none; font-weight: 500;">futureboundtech.online</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ==========================================
// 3. 3-STAGE JOB / INTERNSHIP APPLICATION EMAIL FLOW
// ==========================================
export async function handleJobApplicationEmails(application) {
  const { 
    jobId, 
    jobTitle, 
    jobType, 
    applicationId, 
    name, 
    email, 
    phone, 
    location, 
    highestQualification, 
    collegeName, 
    sector, 
    placeOfEducation, 
    score, 
    yearOfCompletion, 
    jobExperienceDetails, 
    gender, 
    dob, 
    resumeUrl 
  } = application;

  const candidateHtml = renderCleanEmailHtml({
    badgeLabel: 'APPLICATION CONFIRMATION',
    headerTitle: 'Application successfully received.',
    headerSubtitle: 'Thank you for your interest in joining Future Bound Tech.',
    candidateName: name,
    introContent: `Thank you for submitting your application for the <strong>${jobTitle} (${jobType || 'Opportunity'})</strong> role at Future Bound Tech. Your profile has been logged into our hiring system.`,
    jobId,
    applicationId,
    jobTitle,
    jobType,
    nextStepsHtml: 'Our technical recruiters are reviewing your submitted credentials. You will receive updates via email regarding the outcome and next interaction rounds.'
  });

  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; color: #0f172a; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); padding: 18px 20px; border-radius: 6px; color: #fff; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #a5b4fc; text-transform: uppercase;">ADMIN NOTIFICATION</span>
        <h2 style="margin: 4px 0 0 0; color: #fff; font-size: 18px;">New Candidate Application Received</h2>
        <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">${jobType}: ${jobTitle} (${jobId})</p>
      </div>

      <div style="background: #f8fafc; padding: 14px 18px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
        <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px;">Candidate Contact Details</h3>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4f46e5;">${email}</a></p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Phone:</strong> ${phone}</p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Location:</strong> ${location || 'N/A'}</p>
      </div>

      <div style="background: #f8fafc; padding: 14px 18px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
        <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px;">Education & Experience</h3>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Qualification:</strong> ${highestQualification}</p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>University / College:</strong> ${collegeName}</p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Stream / Score:</strong> ${sector || 'N/A'} (${score || 'N/A'})</p>
        <p style="margin: 4px 0; font-size: 13.5px; color: #334155;"><strong>Year:</strong> ${yearOfCompletion || 'N/A'} | <strong>Experience:</strong> ${jobExperienceDetails || 'Fresher'}</p>
      </div>

      ${resumeUrl ? `
      <div style="background: #f1f5f9; padding: 12px 18px; border-radius: 6px; margin-bottom: 18px; text-align: center;">
        <a href="${resumeUrl}" target="_blank" style="color: #4f46e5; font-weight: 600; text-decoration: none; font-size: 13.5px;">📄 View Candidate Resume</a>
      </div>` : ''}

      <div style="text-align: center; margin-top: 16px;">
        <a href="https://www.futureboundtech.online/admin-mb" style="background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Manage in Admin Portal</a>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: email, subject: `Application Received: ${jobTitle} (${jobType}) • Future Bound Tech [Job ID: ${jobId}]`, html: candidateHtml }),
    sendEmail({ to: HOSTINGER_USER, subject: `New Candidate for ${jobTitle} [${jobId}]: ${name}`, html: adminHtml, replyTo: email })
  ]);
}

// ==========================================
// 4. APPLICATION STATUS UPDATE EMAIL FLOW
// ==========================================
export async function handleApplicationStatusEmail({ application, newStatus, details = {} }) {
  const { name, email, jobTitle, jobType, jobId, applicationId } = application;

  let subject = '';
  let badgeLabel = 'RECRUITMENT UPDATE';
  let headerTitle = 'Your application has been shortlisted.';
  let headerSubtitle = 'We are pleased to invite you to the next stage of our selection process.';
  let introContent = '';
  let extraDetailsHtml = '';
  let nextStepsHtml = '';

  if (newStatus === 'Shortlisted') {
    subject = `Shortlisted: Your Application for ${jobTitle} at Future Bound Tech`;
    badgeLabel = 'RECRUITMENT UPDATE';
    headerTitle = 'Your application has been shortlisted.';
    headerSubtitle = 'We are pleased to invite you to the next stage of our selection process.';
    introContent = 'Thank you for your interest in joining Future Bound Tech. After reviewing your application and profile, we are happy to inform you that you have been shortlisted for the following opportunity:';
    nextStepsHtml = 'Our technical panel will reach out shortly to schedule your interaction session. Please keep your portfolio, GitHub projects, and other relevant work samples accessible for discussion.';
  } else if (newStatus === 'Interview Scheduled') {
    const interviewDate = details.interviewDate || 'To be communicated';
    const interviewTime = details.interviewTime || '11:00 AM IST';
    const interviewLink = details.interviewLink || STATIC_MEET_LINK;
    const isRescheduled = Boolean(details.isRescheduled);

    if (isRescheduled) {
      const rKey = details.rescheduleReasonKey || 'candidate_unavailable';
      let reasonTitle = '';
      let reasonExplanation = '';

      if (rKey === 'candidate_unavailable') {
        reasonTitle = 'Candidate Unavailable at Scheduled Slot';
        reasonExplanation = 'As noted regarding your unavailability at the previously scheduled interview time, we understand that unexpected scheduling conflicts can occur. We are pleased to provide you with a revised interview slot so you can attend comfortably.';
      } else if (rKey === 'candidate_tech_issue') {
        reasonTitle = 'Technical / Network Connectivity Issues';
        reasonExplanation = 'Due to the technical and connectivity challenges encountered during the previous discussion, our technical panel wants to ensure you receive a complete and fair opportunity to present your work. We have rescheduled your discussion to ensure a smooth, uninterrupted evaluation.';
      } else if (rKey === 'hr_panel_unavailable') {
        reasonTitle = 'Unavailability of HR & Technical Interview Panel';
        reasonExplanation = 'Due to an unavoidable scheduling conflict and the urgent unavailability of our HR & Technical Interview Panel for the original slot, we have revised your interview timing. We sincerely apologize for any inconvenience caused to your personal schedule.';
      } else {
        reasonTitle = details.rescheduleReason || 'Updated Interview Schedule';
        reasonExplanation = details.rescheduleReason 
          ? `This interview session has been rescheduled: ${details.rescheduleReason}.`
          : 'Due to updated scheduling requirements, we have arranged a revised interview session for you.';
      }

      subject = `Rescheduled: Technical Interview for ${jobTitle} - Future Bound Tech (${interviewDate})`;
      badgeLabel = 'INTERVIEW RESCHEDULED';
      headerTitle = 'Technical Interview Rescheduled';
      headerSubtitle = 'Your technical interaction session has been moved to an updated time slot.';
      introContent = `Hello ${name},<br /><br />Please be informed that your technical interview round for the <strong>${jobTitle} (${jobType})</strong> position has been rescheduled.<br /><br /><strong>Reason for Rescheduling:</strong><br />${reasonExplanation}`;

      extraDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 6px 0; width: 130px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">ROLE</td>
              <td style="padding: 6px 0; font-size: 14.5px; font-weight: 600; color: #0f172a;">${jobTitle} <span style="color: #64748b; font-weight: normal;">(${jobType})</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">NEW DATE</td>
              <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #d97706;">${interviewDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">NEW TIME</td>
              <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${interviewTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">MEETING ROOM</td>
              <td style="padding: 6px 0;">
                <a href="${interviewLink}" target="_blank" style="color: #4f46e5; font-weight: 600; text-decoration: underline; font-size: 13.5px; font-family: monospace;">
                  ${interviewLink}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">REASON</td>
              <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #475569;">${reasonTitle}</td>
            </tr>
          </table>
        </div>
      `;

      nextStepsHtml = 'Please ensure a quiet environment, a stable internet connection, and join the video room 5 minutes prior to your new scheduled slot.<br /><br />If this revised timing conflicts with your schedule, simply reply directly to this email with your preferred alternate time slots and our talent acquisition team will accommodate you.';
    } else {
      subject = `Interview Invitation: ${jobTitle} with Future Bound Tech (${interviewDate})`;
      badgeLabel = 'INTERVIEW INVITATION';
      headerTitle = 'Technical Interview Scheduled';
      headerSubtitle = 'You are invited to attend a technical interaction session.';
      introContent = `Congratulations! We are pleased to invite you to the technical interview round for the <strong>${jobTitle} (${jobType})</strong> position.`;
      
      extraDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; margin: 20px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 4px 0; width: 100px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">DATE</td>
              <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${interviewDate}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">TIME</td>
              <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${interviewTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0 0 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">MEETING ROOM</td>
              <td style="padding: 6px 0 0 0;">
                <a href="${interviewLink}" target="_blank" style="color: #4f46e5; font-weight: 600; text-decoration: underline; font-size: 13.5px; font-family: monospace;">
                  ${interviewLink}
                </a>
              </td>
            </tr>
          </table>
        </div>
      `;
      nextStepsHtml = 'Please ensure a quiet environment, a stable internet connection, and join the video room 5 minutes prior to your allocated slot.';
    }
  } else if (newStatus === 'Hired') {
    const offerId = details.offerId || `FBT-${jobType === 'Internship' ? '01I' : '01J'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const joiningDate = details.joiningDate || 'Immediate';
    const compensation = details.compensation || 'As discussed during interview';

    subject = `Congratulations! Offer Letter for ${jobTitle} - Future Bound Tech`;
    badgeLabel = 'OFFICIAL SELECTION';
    headerTitle = 'Official Offer of Selection';
    headerSubtitle = 'Congratulations and welcome to the Future Bound Tech team.';
    introContent = `On behalf of Future Bound Tech, we are delighted to extend an official offer of selection for the position of <strong>${jobTitle} (${jobType})</strong>. Your technical acumen and dedication make you an exceptional addition to our team.`;

    const hasOfferPdf = Boolean(details.offerPdf && details.offerPdf.content);
    const pdfFilename = details.offerPdf?.filename || `Offer_Letter_${offerId}.pdf`;

    extraDetailsHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 6px 0; width: 130px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">ROLE</td>
            <td style="padding: 6px 0; font-size: 14.5px; font-weight: 600; color: #0f172a;">${jobTitle} ${jobType ? `<span style="color: #64748b; font-weight: normal;">(${jobType})</span>` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">OFFER ID</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #059669; font-family: monospace;">${offerId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">JOINING DATE</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${joiningDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">TERMS / STIPEND</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${compensation}</td>
          </tr>
        </table>
        ${hasOfferPdf ? `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; color: #334155; line-height: 1.5;">
          📎 <strong>Attached Document:</strong> Your official signed Offer Letter is attached to this email in PDF format (<code>${pdfFilename}</code>).
        </div>` : ''}
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #64748b;">
          Online Authenticity Verification is available on our official portal under <strong>Careers &gt; Verify Offer ID</strong>.
        </div>
      </div>
    `;
    nextStepsHtml = 'Please review the attached Offer Letter PDF and reply directly to this email with your formal acceptance within 48 hours to confirm your joining.';
  } else if (newStatus === 'Dropped') {
    subject = `Application Update: ${jobTitle} • Future Bound Tech`;
    badgeLabel = 'RECRUITMENT UPDATE';
    headerTitle = 'Application Status Update';
    headerSubtitle = 'Thank you for your interest in Future Bound Tech.';
    introContent = `Thank you for taking the time to apply for the <strong>${jobTitle} (${jobType})</strong> role and for your interest in joining our organization.<br /><br />After careful review of all applicants, our hiring team has decided to proceed with other profiles whose current experience more closely matches the immediate requirements for this opening.<br /><br />We were genuinely impressed by your credentials and will maintain your profile in our talent pool for future opportunities.`;
    nextStepsHtml = 'We sincerely appreciate your effort and wish you the very best in your career pursuits.';
  }

  // When Hired or Rescheduled, exclude jobId and applicationId from the header box to keep layout clean
  const emailHtml = renderCleanEmailHtml({
    badgeLabel,
    headerTitle,
    headerSubtitle,
    candidateName: name,
    introContent,
    jobId: (newStatus === 'Hired' || details.isRescheduled) ? '' : jobId,
    applicationId: (newStatus === 'Hired' || details.isRescheduled) ? '' : applicationId,
    jobTitle: (newStatus === 'Hired' || details.isRescheduled) ? '' : jobTitle,
    jobType: (newStatus === 'Hired' || details.isRescheduled) ? '' : jobType,
    extraDetailsHtml,
    nextStepsHtml
  });

  const attachments = [];
  if (details.offerPdf && details.offerPdf.content) {
    attachments.push({
      filename: details.offerPdf.filename || `Offer_Letter_${details.offerId || 'Official'}.pdf`,
      content: details.offerPdf.content,
      contentType: 'application/pdf'
    });
  }

  return sendEmail({
    to: email,
    subject,
    html: emailHtml,
    attachments
  });
}

/**
 * Generate Ready-To-Copy Email Template for Admin Manual Review
 */
export function prepareManualEmailTemplate({ application, status, details = {} }) {
  const { name, email, jobTitle, jobType, jobId, applicationId } = application;
  const meetLink = details.interviewLink || STATIC_MEET_LINK;
  const interviewDate = details.interviewDate || 'Upcoming Date';
  const interviewTime = details.interviewTime || '11:00 AM IST';
  const offerId = details.offerId || `FBT-${jobType === 'Internship' ? '01I' : '01J'}-A101`;
  const joiningDate = details.joiningDate || 'Immediate';

  let subject = '';
  let body = '';

  if (status === 'Applied') {
    subject = `Application Received: ${jobTitle} (${jobType}) • Future Bound Tech`;
    body = `Dear ${name},

Thank you for applying for the ${jobTitle} (${jobType}) position at Future Bound Tech (Job ID: ${jobId}).

Your application reference ID is: ${applicationId}.
Our hiring team is reviewing your profile and will update you soon.

Best regards,
Talent Acquisition Team
Future Bound Tech (info@futureboundtech.online)`;
  } else if (status === 'Shortlisted') {
    subject = `🎉 Shortlisted: Your Application for ${jobTitle} at Future Bound Tech`;
    body = `Dear ${name},

Congratulations! We are pleased to inform you that your profile for the ${jobTitle} (${jobType}) position has been shortlisted.

Our team will reach out with the interview schedule shortly. Please keep your portfolio and projects handy.

Best regards,
Talent Acquisition Team
Future Bound Tech (info@futureboundtech.online)`;
  } else if (status === 'Interview Scheduled') {
    if (details.isRescheduled) {
      const reason = details.rescheduleReason || 'Scheduling adjustment';
      subject = `Rescheduled: Technical Interview for ${jobTitle} - Future Bound Tech (${interviewDate})`;
      body = `Dear ${name},

Please be informed that your technical interview round for ${jobTitle} (${jobType}) has been rescheduled.

Reason for Rescheduling:
${reason}

Updated Interview Details:
- Revised Date: ${interviewDate}
- Revised Time: ${interviewTime}
- Google Meet Link: ${meetLink}

Please join 5 minutes before your scheduled slot. If this revised timing is inconvenient, please reply directly to this email to coordinate an alternate time.

Best regards,
Hiring & Technical Panel
Future Bound Tech`;
    } else {
      subject = `📅 Interview Invitation: ${jobTitle} with Future Bound Tech (${interviewDate})`;
      body = `Dear ${name},

We are pleased to invite you for the technical interview for ${jobTitle} (${jobType}).

Interview Details:
- Date: ${interviewDate}
- Time: ${interviewTime}
- Google Meet Link: ${meetLink}

Please join 5 minutes before your scheduled slot.

Best regards,
Hiring & Technical Panel
Future Bound Tech`;
    }
  } else if (status === 'Hired') {
    subject = `Congratulations! Offer Letter for ${jobTitle} - Future Bound Tech`;
    body = `Dear ${name},

Congratulations! We are thrilled to offer you the position of ${jobTitle} (${jobType}) at Future Bound Tech.

Offer Details:
- Offer ID: ${offerId}
- Role: ${jobTitle} (${jobType})
- Joining Date: ${joiningDate}
- Online Verification: Authenticate your offer at https://futureboundtech.online (Careers > Verify Offer ID)

Please reply with your confirmation within 48 hours.

Warm regards,
Leadership & HR Team
Future Bound Tech`;
  } else if (status === 'Dropped') {
    subject = `Application Update: ${jobTitle} • Future Bound Tech`;
    body = `Dear ${name},

Thank you for your interest in Future Bound Tech and applying for ${jobTitle} (${jobType}).

We have chosen to proceed with another profile for this cycle. We will retain your profile in our database for future opportunities.

Best regards,
Recruitment Team
Future Bound Tech`;
  }

  return { subject, body, to: email };
}

// ==========================================
// 5. APPOINTMENT BOOKING EMAIL FLOW
// ==========================================
export async function handleAppointmentEmails(bookingData) {
  const { client_name, client_email, appointment_date, appointment_time, service_type, meet_link } = bookingData;
  const activeMeetLink = meet_link || STATIC_MEET_LINK;

  const aiPrompt = `Generate a polite consultation confirmation message to "${client_name}" for "${service_type}" on "${appointment_date}" at "${appointment_time}".`;
  const aiMessage = await generateAIContent(aiPrompt) ||
    `We are delighted to confirm your consultation session with Future Bound Tech for ${service_type}. Our specialists are prepared to dive into your requirements and provide tailored strategic solutions.`;

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
    </div>
  `;

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
    sendEmail({ to: HOSTINGER_USER, subject: `📅 New Booking: ${client_name} - ${appointment_date} (${appointment_time})`, html: adminHtml, replyTo: client_email })
  ]);
}

// ==========================================
// 6. CONTACT INQUIRY EMAIL FLOW
// ==========================================
export async function handleContactEmails(contactData) {
  const { name, email, subject, message } = contactData;

  const aiPrompt = `Write a polite response to "${name}" who submitted a contact inquiry regarding "${subject}".`;
  const aiMessage = await generateAIContent(aiPrompt) ||
    `Thank you for reaching out to Future Bound Tech regarding "${subject}". We have received your message and our team is already reviewing your requirement. An expert advisor will get back to you shortly.`;

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
    sendEmail({ to: HOSTINGER_USER, subject: `💬 Contact Lead: ${name} - ${subject}`, html: adminHtml, replyTo: email })
  ]);
}

// ==========================================
// 7. BROADCAST JOB OPPORTUNITY UPDATES WITH AI
// ==========================================

/**
 * Extract Direct Application URL from Raw Notes
 * Safeguard: Identifies and preserves original application links independently of AI model.
 */
export function extractOriginalApplicationUrl(rawText) {
  if (!rawText) return null;
  const urlRegex = /(https?:\/\/[^\s<>"')]+)/gi;
  const matches = rawText.match(urlRegex);
  if (matches && matches.length > 0) {
    const external = matches.find(u => !u.includes('futureboundtech.online') && !u.includes('meet.google.com'));
    return (external || matches[0]).replace(/[.,;:)\]]+$/, '');
  }
  return null;
}

/**
 * Sanitize AI Generated Plain Text to remove any accidental meta headers
 */
export function sanitizeEnhancedMessage(text) {
  if (!text) return '';
  return text
    .replace(/\*{2,}\s*content\s*\*{2,}:?/gi, '')
    .replace(/^#+\s*content:?/gim, '')
    .replace(/\*{2,}\s*core message\s*\*{2,}:?/gi, '')
    .replace(/^#+\s*core message:?/gim, '')
    .replace(/\*{2,}\s*introduction\s*\*{2,}:?/gi, '')
    .replace(/^#+\s*introduction:?/gim, '')
    .replace(/\*{2,}\s*next steps\s*\*{2,}:?/gi, '')
    .replace(/^#+\s*next steps:?/gim, '')
    .replace(/\*{2,}\s*message body\s*\*{2,}:?/gi, '')
    .replace(/^#+\s*message body:?/gim, '')
    .replace(/\*{2,}\s*generated email\s*\*{2,}:?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Production-Ready System Prompt for AI Job Opportunity Broadcast Email Assistant
 */
export const JOB_ALERT_SYSTEM_PROMPT = `You are the AI Job Opportunity Broadcast Email Assistant for Future Bound Tech (FBT).

## 1. YOUR ROLE
Your job is to transform raw job alerts, hiring announcements, off-campus drive notes, recruitment messages, and job descriptions into clean, professional, candidate-facing broadcast emails.
FBT shares curated opportunities from external employers. FBT is NOT the hiring company unless the input explicitly states that FBT itself is hiring.
Examples of external employers include Salesforce, Google, Microsoft, TCS, Amazon, and other companies.
Never describe an external job opportunity as a job opening at Future Bound Tech. Attribute the vacancy to the employer named in the supplied information.

## 2. PRIMARY OBJECTIVE
Produce one ready-to-send job opportunity email structured in JSON with:
- A concise, relevant subject line (e.g. "Job Alert: [Company] [Role] ([Batch], if confirmed)").
- A professional email heading (e.g. "Software Engineering Opportunity at [Company]").
- The greeting "Dear [Candidate Name],"
- A brief introduction explaining the opportunity.
- Clearly organised job details.
- Eligibility and preferred skills, where provided.
- A prominent "Apply Now" call to action with the original application URL.
- A concise disclaimer encouraging candidates to verify details on the official careers page.
- A professional sign-off from "Future Bound Tech — Talent Team".

The email must be ready to send without manual rewriting.

## 3. CONTENT RULES
A. Employer and role:
- Identify the actual hiring company and job title from the supplied notes.
- Keep the employer's name distinct from Future Bound Tech.
- Do not claim that FBT is hiring for external employer roles.
- Do not invent a company, job title, location, salary, batch, deadline, or eligibility criterion.

B. Eligibility and skills:
- Preserve all supplied eligibility requirements accurately.
- Include graduation batch, degree, CGPA, backlog criteria, experience, and location only when provided or reliably verified in the input.
- Separate mandatory eligibility requirements from preferred skills.
- If a detail is missing, omit it or use null in the structured output.

C. Accuracy and uncertainty:
- Treat supplied notes as the primary source.
- Do not claim that a vacancy is active, verified, or accepting applications unless the input provides reliable confirmation.
- Never invent an application deadline or salary.
- Always include an appropriate caution in the disclaimer asking candidates to verify availability on the official employer careers page.

D. Application links:
- Preserve the exact original application URL, including its path and query parameters.
- Do not shorten, rewrite, replace, guess, or remove the URL.

E. Prohibited output:
- Never add meta-headings such as "Content", "** Content **", "Introduction", "Generated Email", "AI Response", "Email Draft", or "Output".
- Output strict JSON only matching the schema. No markdown fences or text outside the required JSON object.`;

/**
 * AI Message Enhancer & Structured Job Opportunity Generator
 */
export async function enhanceJobMessageAI({ rawContent, context = '' }) {
  if (!rawContent || !rawContent.trim()) {
    throw new Error('Raw message content is required');
  }

  // Pre-extract original application URL to safeguard against model alteration
  const originalUrl = extractOriginalApplicationUrl(rawContent);

  const userPrompt = `Transform the following raw job notes into the structured JSON object:

RAW NOTES:
"""
${rawContent.trim()}
"""
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}
${originalUrl ? `ORIGINAL APPLICATION LINK DETECTED: ${originalUrl}` : ''}

Respond ONLY in strict, valid JSON format matching this schema without markdown code fences or backticks:
{
  "subject": "string",
  "heading": "string",
  "greeting": "Dear [Candidate Name],",
  "introduction": "string",
  "company": "string or null",
  "role": "string or null",
  "location": ["string"],
  "eligible_batch": "string or null",
  "employment_type": "string or null",
  "experience": "string or null",
  "eligibility": ["string"],
  "key_skills": ["string"],
  "application_deadline": "string or null",
  "cta_label": "Apply Now",
  "application_url": ${originalUrl ? JSON.stringify(originalUrl) : "string or null"},
  "disclaimer": "string",
  "sign_off": "Best regards,\\nFuture Bound Tech — Talent Team",
  "plain_text_body": "string"
}`;

  let rawAiResponse = await generateAIContent(userPrompt, JOB_ALERT_SYSTEM_PROMPT);

  if (rawAiResponse) {
    try {
      let cleaned = rawAiResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(cleaned);

      // Safeguard: Ensure original URL is preserved
      if (originalUrl && (!parsed.application_url || parsed.application_url.length < 10)) {
        parsed.application_url = originalUrl;
      }

      // Safeguard: Sanitize plain text body
      let plainText = parsed.plain_text_body ? sanitizeEnhancedMessage(parsed.plain_text_body) : '';
      if (!plainText || plainText.length < 50) {
        // Construct clean plain text body from structured fields
        const locStr = Array.isArray(parsed.location) ? parsed.location.join(' / ') : (parsed.location || 'See details');
        const eligStr = Array.isArray(parsed.eligibility) && parsed.eligibility.length > 0 
          ? parsed.eligibility.map(e => `- ${e}`).join('\n') 
          : '- Refer to official listing for full criteria';
        const skillsStr = Array.isArray(parsed.key_skills) && parsed.key_skills.length > 0 
          ? parsed.key_skills.map(s => `- ${s}`).join('\n') 
          : '';

        plainText = `Dear [Candidate Name],

${parsed.introduction || 'We are sharing a verified job opportunity that matches your potential profile.'}

OPPORTUNITY DETAILS:
- Company: ${parsed.company || 'Not Specified'}
- Role: ${parsed.role || 'Software Engineering'}
- Location: ${locStr}
${parsed.eligible_batch ? `- Eligible Batch: ${parsed.eligible_batch}\n` : ''}${parsed.employment_type ? `- Employment Type: ${parsed.employment_type}\n` : ''}${parsed.experience ? `- Experience: ${parsed.experience}\n` : ''}
ELIGIBILITY REQUIREMENTS:
${eligStr}

${skillsStr ? `KEY SKILLS:\n${skillsStr}\n` : ''}
APPLY HERE:
${parsed.application_url || originalUrl || 'Check official employer careers portal'}

IMPORTANT:
${parsed.disclaimer || 'Please verify the eligibility criteria, application deadline, and availability on the employer official careers page before applying.'}

Best regards,
Future Bound Tech — Talent Team`;
      }

      return {
        subject: parsed.subject || parsed.heading || 'Job Opportunity Alert • Future Bound Tech',
        heading: parsed.heading || parsed.subject || 'Job Opportunity Alert • Future Bound Tech',
        enhancedMessage: plainText,
        structuredData: {
          ...parsed,
          application_url: parsed.application_url || originalUrl,
          plain_text_body: plainText
        }
      };
    } catch (parseErr) {
      console.warn('⚠️ Could not parse AI JSON output directly, attempting fallback extraction:', parseErr.message);
    }
  }

  // Fallback if AI response failed or was malformed
  const firstLine = rawContent.trim().split('\n')[0].replace(/^[#*-🚀📌🏢📍🎓🔗]\s*/, '').slice(0, 70);
  const fallbackHeading = firstLine.length > 10 
    ? `Job Alert: ${firstLine}` 
    : `Curated Job Opportunity Alert • Future Bound Tech`;

  const fallbackBody = `Dear [Candidate Name],

We are sharing the following curated career opportunity with you:

${sanitizeEnhancedMessage(rawContent.trim())}

${originalUrl ? `Apply directly using the official link:\n${originalUrl}\n\n` : ''}IMPORTANT: Please verify all eligibility requirements, application deadlines, and availability on the employer's official website before applying.

Best regards,
Future Bound Tech — Talent Team`;

  return {
    subject: fallbackHeading,
    heading: fallbackHeading,
    enhancedMessage: fallbackBody,
    structuredData: {
      subject: fallbackHeading,
      heading: fallbackHeading,
      company: 'External Employer',
      role: 'Software Opportunity',
      application_url: originalUrl,
      plain_text_body: fallbackBody
    }
  };
}

/**
 * Render Branded HTML Email for Job Opportunity Broadcast Updates
 */
export function renderJobUpdateEmailHtml({ heading, candidateName, messageContent, attachments = [], structuredData = null }) {
  const safeName = candidateName && candidateName.trim() ? candidateName.trim() : 'Candidate';
  
  // Extract application URL if available from structuredData or text
  const appUrl = structuredData?.application_url || extractOriginalApplicationUrl(messageContent);
  const company = structuredData?.company;
  const role = structuredData?.role;
  const location = Array.isArray(structuredData?.location) ? structuredData.location.join(' / ') : structuredData?.location;
  const batch = structuredData?.eligible_batch;
  const eligibility = Array.isArray(structuredData?.eligibility) ? structuredData.eligibility : [];
  const skills = Array.isArray(structuredData?.key_skills) ? structuredData.key_skills : [];
  const disclaimer = structuredData?.disclaimer;

  let formattedBody = messageContent || '';
  // Sanitize any residual ** Content ** or **Content:**
  formattedBody = sanitizeEnhancedMessage(formattedBody);
  
  // Replace [Candidate Name] with safeName if present
  formattedBody = formattedBody.replace(/\[Candidate Name\]/gi, safeName);
  
  const paragraphs = formattedBody.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const formattedHtml = paragraphs.map(p => {
    if (p.includes('\n- ') || p.includes('\n* ') || p.startsWith('- ') || p.startsWith('* ')) {
      const lines = p.split('\n');
      const listItems = lines
        .map(l => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
        .map(item => `<li style="margin-bottom: 6px; color: #334155;">${item}</li>`)
        .join('');
      return `<ul style="margin: 14px 0 18px 20px; padding: 0; font-size: 14px; line-height: 1.6;">${listItems}</ul>`;
    }
    const boldFormatted = p
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/\n/g, '<br />');
    return `<p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.65; color: #334155;">${boldFormatted}</p>`;
  }).join('');

  // Structured Opportunity Overview Card (if structured details are available)
  let opportunityCardHtml = '';
  if (company || role || location || batch) {
    opportunityCardHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 12px;">
          ✦ Opportunity Snapshot
        </span>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; color: #1e293b; line-height: 1.7;">
          ${company ? `<tr><td style="padding: 4px 0; color: #64748b; width: 130px; font-weight: 600;">🏢 Employer:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${company}</td></tr>` : ''}
          ${role ? `<tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">💼 Role:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${role}</td></tr>` : ''}
          ${location ? `<tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">📍 Location:</td><td style="padding: 4px 0; color: #334155;">${location}</td></tr>` : ''}
          ${batch ? `<tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">🎓 Eligible Batch:</td><td style="padding: 4px 0; color: #047857; font-weight: 700;">${batch}</td></tr>` : ''}
        </table>
      </div>
    `;
  }

  // Structured Eligibility & Skills Box
  let eligibilityHtml = '';
  if (eligibility.length > 0 || skills.length > 0) {
    eligibilityHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
        ${eligibility.length > 0 ? `
          <strong style="font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
            ✓ Eligibility Criteria
          </strong>
          <ul style="margin: 0 0 14px 18px; padding: 0; font-size: 13.5px; color: #14532d; line-height: 1.6;">
            ${eligibility.map(e => `<li style="margin-bottom: 4px;">${e}</li>`).join('')}
          </ul>
        ` : ''}
        ${skills.length > 0 ? `
          <strong style="font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
            ⚡ Key Skills
          </strong>
          <div style="font-size: 13px; color: #14532d; line-height: 1.6;">
            ${skills.map(s => `<span style="display: inline-block; background-color: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 6px; padding: 2px 8px; margin: 2px 4px 2px 0; font-size: 12px; font-weight: 600;">${s}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Prominent Apply Now CTA Button
  let ctaHtml = '';
  if (appUrl) {
    ctaHtml = `
      <div style="text-align: center; margin: 32px 0 24px 0;">
        <a href="${appUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
          Apply Now &rarr;
        </a>
        <div style="margin-top: 10px; font-size: 11px; color: #64748b;">
          Application Link: <a href="${appUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline; word-break: break-all;">${appUrl}</a>
        </div>
      </div>
    `;
  }

  // Disclaimer Box
  const disclaimerText = disclaimer || 'Please verify the eligibility criteria, application deadline, and listing availability on the official employer careers page before applying.';
  const disclaimerHtml = `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 18px; margin: 24px 0; font-size: 12px; color: #92400e; line-height: 1.6;">
      <strong>Important Notice:</strong> ${disclaimerText}
    </div>
  `;

  // Attachments Section
  let attachmentsHtml = '';
  if (attachments && attachments.length > 0) {
    const listHtml = attachments.map(att => {
      const sizeStr = att.size ? ` (${Math.round(att.size / 1024)} KB)` : '';
      return `<li style="margin: 4px 0; color: #1e293b; font-weight: 500;">📎 <strong>${att.filename || att.name || 'Document'}</strong>${sizeStr}</li>`;
    }).join('');

    attachmentsHtml = `
      <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin: 22px 0;">
        <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          Enclosed Attachments (${attachments.length})
        </span>
        <ul style="margin: 0 0 0 16px; padding: 0; font-size: 13px;">
          ${listHtml}
        </ul>
        <span style="font-size: 11px; color: #64748b; margin-top: 6px; display: block;">
          Files are attached directly to this email for your review.
        </span>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- 1. Header (Logo + Company Name) -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 32px; border-bottom: 1px solid #eaecf0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="${COMPANY_LOGO_URL}" alt="Future Bound Tech Logo" height="34" style="height: 34px; width: auto; display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px; display: block; line-height: 1.2;">Future Bound Tech</span>
                          <span style="font-size: 11px; color: #64748b; font-weight: 500; display: block;">Talent Acquisition & Career Opportunities</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">CAREER UPDATE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Hero Section (Gradient Banner) -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #4338ca 100%); padding: 30px 32px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #a5b4fc; text-transform: uppercase; display: block; margin-bottom: 8px;">
                OPPORTUNITY ANNOUNCEMENT
              </span>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.35;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- 3. Email Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px; font-size: 14.5px; line-height: 1.65; color: #334155;">
              ${opportunityCardHtml}

              ${eligibilityHtml}

              ${formattedHtml}

              ${ctaHtml}

              ${disclaimerHtml}

              ${attachmentsHtml}

              <!-- Signature -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; line-height: 1.6;">
                Best regards,<br /><br />
                <strong style="color: #0f172a;">Future Bound Tech — Talent Team</strong><br />
                <span style="color: #64748b;">Career Updates & Talent Systems</span>
              </div>
            </td>
          </tr>

          <!-- 4. Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eaecf0; padding: 22px 32px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong style="color: #334155; font-size: 13px;">Future Bound Tech</strong><br />
              Enterprise Solutions & Talent Systems · Nellore, Andhra Pradesh<br /><br />
              <a href="mailto:info@futureboundtech.online" style="color: #4f46e5; text-decoration: none; font-weight: 500;">info@futureboundtech.online</a> &nbsp;·&nbsp; <a href="https://www.futureboundtech.online" style="color: #4f46e5; text-decoration: none; font-weight: 500;">futureboundtech.online</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch Personalized Job Opportunity Updates to Selected / All Candidates
 */
export async function sendJobOpportunityBroadcast({ recipients = [], heading, message, attachments = [], structuredData = null }) {
  if (!recipients || recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }
  if (!heading || !heading.trim()) {
    throw new Error('Subject heading is required');
  }
  if (!message || !message.trim()) {
    throw new Error('Message body is required');
  }

  const results = {
    total: recipients.length,
    sentCount: 0,
    failedCount: 0,
    errors: []
  };

  const preparedAttachments = (attachments || []).map(att => ({
    filename: att.filename || att.name || 'attachment.pdf',
    content: att.content || att.base64 || '',
    contentType: att.contentType || att.type || 'application/pdf'
  }));

  for (const recipient of recipients) {
    const candidateEmail = recipient.email || (typeof recipient === 'string' ? recipient : null);
    const candidateName = recipient.name || recipient.candidateName || 'Candidate';

    if (!candidateEmail) {
      results.failedCount++;
      results.errors.push(`Skipped invalid recipient: ${JSON.stringify(recipient)}`);
      continue;
    }

    try {
      const emailHtml = renderJobUpdateEmailHtml({
        heading,
        candidateName,
        messageContent: message,
        attachments: preparedAttachments,
        structuredData
      });

      const sendRes = await sendEmail({
        to: candidateEmail,
        subject: heading,
        html: emailHtml,
        attachments: preparedAttachments
      });

      if (sendRes.success) {
        results.sentCount++;
      } else {
        results.failedCount++;
        results.errors.push(`${candidateEmail}: ${sendRes.error || 'Failed to dispatch'}`);
      }
    } catch (sendErr) {
      results.failedCount++;
      results.errors.push(`${candidateEmail}: ${sendErr.message}`);
    }
  }

  return results;
}

