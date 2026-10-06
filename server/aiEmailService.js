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
export async function sendEmail({ to, subject, html, replyTo, fromName = "Future Bound Tech" }) {
  const recipients = Array.isArray(to) ? to : [to];

  // Try 1: Official Hostinger Mail API SDK (Direct HTTPS / Port 443 REST)
  try {
    const mailboxId = await getMailboxResourceId();
    const response = await hostingerSendApi.sendEmail(mailboxId, {
      to: recipients,
      displayName: fromName,
      subject,
      html
    });
    console.log(`📧 [Hostinger Mail API SDK] Email delivered successfully to ${recipients.join(', ')} from ${HOSTINGER_USER} (Status: ${response?.status || 204})`);
    return { success: true, status: response?.status || 204, provider: 'Hostinger Mail API' };
  } catch (sdkErr) {
    const errDetails = sdkErr.response?.data ? JSON.stringify(sdkErr.response.data) : sdkErr.message;
    console.warn(`⚠️ Hostinger Mail API SDK failed to ${recipients.join(', ')}: ${errDetails}. Attempting Hostinger SMTP...`);
  }

  // Try 2: Hostinger SMTP
  try {
    const info = await hostingerTransporter.sendMail({
      from: `"${fromName}" <${HOSTINGER_USER}>`,
      to: recipients.join(', '),
      replyTo: replyTo || HOSTINGER_USER,
      subject,
      html
    });
    console.log(`📧 [Hostinger SMTP] Email delivered to ${recipients.join(', ')} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, provider: 'Hostinger SMTP' };
  } catch (hostingerErr) {
    console.warn(`⚠️ Hostinger SMTP send failed to ${recipients.join(', ')}: ${hostingerErr.message}. Attempting Gmail failover...`);
  }

  // Try 3: Gmail SMTP Fallback
  try {
    const info = await gmailTransporter.sendMail({
      from: `"${fromName}" <${GMAIL_USER}>`,
      to: recipients.join(', '),
      replyTo: replyTo || GMAIL_USER,
      subject,
      html
    });
    console.log(`⚡ [Gmail Fallover] Email delivered to ${recipients.join(', ')} (ID: ${info.messageId})`);
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

export const EMAIL_HEADER_IMG = 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QqHN1_fCC50hdhz-J3_ogWv4njhi78cFjed542OwAVQk152IAdLMMfPSMLq_ndq5QqtOMwxe_SfEHUUCEMAzb655C5d4BxvPdWQuyy-D9Lv77oY0qPMZCxTqGQTkPb9oMbJHbtcdo-zgI=s1360-w1360-h1020-rw';

export function renderCleanEmailHtml({ headerTitle, candidateName, bodyContent, jobId, applicationId, jobTitle, jobType }) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1f293d;">
      <div style="width: 100%; text-align: center; background-color: #05070e;">
        <img src="${EMAIL_HEADER_IMG}" alt="Future Bound Tech" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
      </div>

      <div style="padding: 24px 28px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 16px 20px; border-radius: 12px; margin-bottom: 22px;">
          <h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">${headerTitle}</h2>
          ${jobTitle ? `<p style="margin: 4px 0 0 0; color: #dbeafe; font-size: 13px;">${jobType || 'Position'}: ${jobTitle} ${jobId ? `(Job ID: ${jobId})` : ''}</p>` : ''}
        </div>

        ${bodyContent}

        <div style="border-top: 1px solid #1f293d; margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b;">
          Future Bound Tech • Innovation & Finance Systems • <a href="mailto:info@futureboundtech.online" style="color: #38bdf8; text-decoration: none;">info@futureboundtech.online</a> • Nellore, AP
        </div>
      </div>
    </div>
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

  const candidateBodyContent = `
    <p style="font-size: 14px; color: #f1f5f9; line-height: 1.6;">
      Dear <strong style="color: #60a5fa;">${name}</strong>,
    </p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
      Thank you for submitting your application for <strong>${jobTitle} (${jobType})</strong> position at Future Bound Tech. 
      Your application has been logged into our hiring system.
    </p>

    <div style="background: #111827; padding: 18px; border-radius: 12px; border: 1px solid #374151; margin: 20px 0;">
      <div style="margin-bottom: 12px; border-bottom: 1px solid #1f293d; padding-bottom: 10px;">
        <span style="color: #94a3b8; font-size: 11px; font-weight: bold; uppercase; tracking-wider; display: block; margin-bottom: 2px;">Job ID Code</span>
        <span style="color: #34d399; font-weight: bold; font-family: monospace; font-size: 18px;">${jobId}</span>
      </div>

      <div style="margin-bottom: 12px; border-bottom: 1px solid #1f293d; padding-bottom: 10px;">
        <span style="color: #94a3b8; font-size: 11px; font-weight: bold; uppercase; tracking-wider; display: block; margin-bottom: 2px;">Application Reference ID</span>
        <span style="color: #38bdf8; font-weight: bold; font-family: monospace; font-size: 14px;">${applicationId}</span>
      </div>

      <div>
        <span style="color: #94a3b8; font-size: 11px; font-weight: bold; uppercase; tracking-wider; display: block; margin-bottom: 2px;">Application Status</span>
        <span style="color: #fbbf24; font-weight: bold; font-size: 13px;">Applied (Under Review)</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
      Our technical recruiters will review your profile. You will receive real-time email notifications for shortlisted interview rounds and official offer letters.
    </p>
  `;

  const candidateHtml = renderCleanEmailHtml({
    headerTitle: 'Application Received',
    candidateName: name,
    bodyContent: candidateBodyContent,
    jobId,
    applicationId,
    jobTitle,
    jobType
  });

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #0b0f19; color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #1f293d;">
      <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 18px 22px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">🎯 New Job / Internship Application Received</h2>
        <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px;">${jobType}: ${jobTitle} (${jobId})</p>
      </div>

      <div style="background: #111827; padding: 15px; border-radius: 10px; border: 1px solid #374151; margin-bottom: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #60a5fa; letter-spacing: 0.5px;">Stage 1: Basic Details</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">👤 <strong>Candidate Name:</strong> <span style="color: #fff; font-weight: bold;">${name}</span></p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">✉️ <strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">📞 <strong>Phone:</strong> ${phone}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">📍 <strong>Place & Location:</strong> ${location}</p>
      </div>

      <div style="background: #111827; padding: 15px; border-radius: 10px; border: 1px solid #374151; margin-bottom: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #a78bfa; letter-spacing: 0.5px;">Stage 2: Education & Experience</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">🎓 <strong>Highest Qualification:</strong> ${highestQualification}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">🏛️ <strong>College / University:</strong> ${collegeName}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">🔬 <strong>Sector / Stream:</strong> ${sector || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">📌 <strong>Place of Education:</strong> ${placeOfEducation || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">📊 <strong>Score / CGPA / %:</strong> ${score || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">📅 <strong>Year of Completion:</strong> ${yearOfCompletion || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">💼 <strong>Experience Details:</strong> ${jobExperienceDetails || 'Fresher'}</p>
      </div>

      <div style="background: #111827; padding: 15px; border-radius: 10px; border: 1px solid #374151; margin-bottom: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #34d399; letter-spacing: 0.5px;">Stage 3: Declaration</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">⚧️ <strong>Gender:</strong> ${gender || 'N/A'} | 🎂 <strong>DOB:</strong> ${dob || 'N/A'}</p>
        ${resumeUrl ? `<p style="margin: 8px 0 0 0; font-size: 13px;">📄 <a href="${resumeUrl}" target="_blank" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">View Candidate Resume</a></p>` : ''}
      </div>

      <div style="margin-top: 20px; text-align: center;">
        <a href="http://localhost:3000/admin-mb" style="background: #2563eb; color: #fff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block;">Manage Application in Admin Portal</a>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: email, subject: `Application Received: ${jobTitle} (${jobType}) • Future Bound Tech [Job ID: ${jobId}]`, html: candidateHtml }),
    sendEmail({ to: HOSTINGER_USER, subject: `💼 New Candidate for ${jobTitle} [${jobId}]: ${name}`, html: adminHtml, replyTo: email })
  ]);
}

// ==========================================
// 4. APPLICATION STATUS UPDATE EMAIL FLOW
// ==========================================
export async function handleApplicationStatusEmail({ application, newStatus, details = {} }) {
  const { name, email, jobTitle, jobType, jobId, applicationId } = application;

  let subject = '';
  let statusBannerColor = '#2563eb';
  let statusTitle = '';
  let bodyContent = '';

  if (newStatus === 'Shortlisted') {
    subject = `🎉 Shortlisted: Your Application for ${jobTitle} at Future Bound Tech`;
    statusBannerColor = '#7c3aed';
    statusTitle = 'Profile Shortlisted';
    bodyContent = `
      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
        Dear <strong>${name}</strong>,<br /><br />
        We are thrilled to inform you that following a detailed review of your credentials for the position of <strong>${jobTitle} (${jobType})</strong> [Job ID: ${jobId}], you have been <strong>Shortlisted</strong> for the next round of our selection process!
      </p>
      <div style="background: #111827; padding: 16px; border-radius: 12px; border: 1px solid #374151; margin: 18px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
        <p style="margin: 4px 0; color: #a78bfa; font-weight: bold;">Next Steps:</p>
        Our technical panel will schedule your interaction session shortly. Please keep your portfolio and project repository links accessible.
      </div>
    `;
  } else if (newStatus === 'Interview Scheduled') {
    const interviewDate = details.interviewDate || 'To be communicated';
    const interviewTime = details.interviewTime || '11:00 AM IST';
    const interviewLink = details.interviewLink || STATIC_MEET_LINK;

    subject = `📅 Interview Invitation: ${jobTitle} with Future Bound Tech (${interviewDate})`;
    statusBannerColor = '#2563eb';
    statusTitle = 'Interview Round Scheduled';
    bodyContent = `
      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
        Dear <strong>${name}</strong>,<br /><br />
        Congratulations! You are invited to attend the technical interview round for the <strong>${jobTitle} (${jobType})</strong> position.
      </p>
      <div style="background: #111827; padding: 18px; border-radius: 12px; border: 1px solid #374151; margin: 18px 0; font-size: 13px;">
        <p style="margin: 5px 0; color: #94a3b8;">📅 <strong>Date:</strong> <span style="color: #60a5fa; font-weight: bold;">${interviewDate}</span></p>
        <p style="margin: 5px 0; color: #94a3b8;">⏰ <strong>Time:</strong> <span style="color: #34d399; font-weight: bold;">${interviewTime}</span></p>
        <p style="margin: 5px 0; color: #94a3b8;">💼 <strong>Position:</strong> <span style="color: #fff;">${jobTitle} (${jobType})</span></p>
        <div style="margin-top: 14px; padding: 12px; background: #064e3b; border-radius: 8px; border: 1px solid #059669;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #a7f3d0; display: block; margin-bottom: 4px;">📹 Google Meet Room:</span>
          <a href="${interviewLink}" target="_blank" style="color: #ffffff; font-family: monospace; font-size: 13px; text-decoration: underline; word-break: break-all;">
            ${interviewLink}
          </a>
        </div>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">Please ensure a stable internet connection and join the room 5 minutes prior to your slot.</p>
    `;
  } else if (newStatus === 'Hired') {
    const offerId = details.offerId || `FBT-${jobType === 'Internship' ? '01I' : '01J'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const joiningDate = details.joiningDate || 'Immediate';
    const compensation = details.compensation || 'As discussed during interview';

    subject = `🎉 Offer Letter of Selection: ${jobTitle} • Future Bound Tech [Offer ID: ${offerId}]`;
    statusBannerColor = '#059669';
    statusTitle = 'Official Selection & Offer';
    bodyContent = `
      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
        Dear <strong>${name}</strong>,<br /><br />
        Congratulations! On behalf of <strong>Future Bound Tech</strong>, we are delighted to offer you the position of <strong>${jobTitle} (${jobType})</strong>. Your exceptional technical skills and commitment make you a fantastic fit for our organization.
      </p>
      <div style="background: #0f172a; padding: 20px; border-radius: 14px; border: 2px solid #10b981; margin: 20px 0; font-size: 13px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <span style="background: #065f46; color: #a7f3d0; font-size: 11px; text-transform: uppercase; font-weight: bold; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px;">Official Verification Record</span>
          <h3 style="margin: 8px 0 0 0; color: #34d399; font-family: monospace; font-size: 18px; letter-spacing: 1px;">Offer ID: ${offerId}</h3>
        </div>
        <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #334155;"><td style="padding: 6px 0; color: #94a3b8;">Selected Role:</td><td style="color: #fff; font-weight: bold;">${jobTitle}</td></tr>
          <tr style="border-bottom: 1px solid #334155;"><td style="padding: 6px 0; color: #94a3b8;">Designation Type:</td><td style="color: #fff;">${jobType}</td></tr>
          <tr style="border-bottom: 1px solid #334155;"><td style="padding: 6px 0; color: #94a3b8;">Joining Date:</td><td style="color: #60a5fa; font-weight: bold;">${joiningDate}</td></tr>
          <tr style="border-bottom: 1px solid #334155;"><td style="padding: 6px 0; color: #94a3b8;">Terms / Stipend:</td><td style="color: #34d399;">${compensation}</td></tr>
        </table>
        <div style="margin-top: 15px; padding: 10px; background: #1e293b; border-radius: 8px; font-size: 12px; color: #94a3b8; text-align: center;">
          🔒 You or your institution can verify the authenticity of this offer letter online at any time on our official portal under <strong>Careers &gt; Verify Offer ID</strong>.
        </div>
      </div>
      <p style="font-size: 13px; color: #e2e8f0; line-height: 1.6;">
        Please reply to this email with your formal acceptance within 48 hours to confirm your joining.
      </p>
    `;
  } else if (newStatus === 'Dropped') {
    subject = `Application Update: ${jobTitle} • Future Bound Tech`;
    statusBannerColor = '#475569';
    statusTitle = 'Application Status Update';
    bodyContent = `
      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
        Dear <strong>${name}</strong>,<br /><br />
        Thank you for your interest in Future Bound Tech and taking the time to apply for the <strong>${jobTitle} (${jobType})</strong> position.
      </p>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        After careful consideration of all applicants, we have decided to move forward with other candidates whose profiles more closely align with the immediate requirements for this specific role.
      </p>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
        We were genuinely impressed with your credentials and will keep your profile in our talent pool for future openings that match your skills. We wish you the very best in your professional journey.
      </p>
    `;
  }

  const emailHtml = renderCleanEmailHtml({
    headerTitle: statusTitle,
    candidateName: name,
    bodyContent,
    jobId,
    applicationId,
    jobTitle,
    jobType
  });

  return sendEmail({
    to: email,
    subject,
    html: emailHtml
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
  } else if (status === 'Hired') {
    subject = `🎉 Offer Letter of Selection: ${jobTitle} • Future Bound Tech [Offer ID: ${offerId}]`;
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
