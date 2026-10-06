import express from 'express';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getCollection } from './db.js';
import { 
  handleCareerEmails, 
  handleJobApplicationEmails,
  handleApplicationStatusEmail,
  prepareManualEmailTemplate,
  generateJobDescriptionAI,
  handleAppointmentEmails, 
  handleContactEmails, 
  sendAdminLoginNotification,
  generateUniqueReviewAI,
  STATIC_MEET_LINK 
} from './aiEmailService.js';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// Ensure upload directory exists (use tmp in serverless environments like Vercel)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless
  ? path.join(os.tmpdir(), 'resumes')
  : path.join(process.cwd(), 'server', 'uploads', 'resumes');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Warning: Could not create upload directory:', err.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to generate unique Job IDs
function generateUniqueJobId(type) {
  const prefix = type === 'Internship' ? 'FBT-01I' : 'FBT-01J';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
}

// Helper to generate unique Offer IDs (e.g. FBT-01I-A101)
function generateUniqueOfferId(type) {
  const prefix = type === 'Internship' ? 'FBT-01I' : 'FBT-01J';
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${letter}${num}`;
}

// ==========================================
// 0. ADMIN AUTHENTICATION
// ==========================================
apiRouter.post('/admin/login', async (req, res) => {
  try {
    const { key } = req.body;
    if (key === 'adminbasha') {
      const clientInfo = {
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Localhost',
        userAgent: req.headers['user-agent'] || 'Browser'
      };

      // Send self-notification email in background
      sendAdminLoginNotification(clientInfo).catch(err => console.error('Admin login email notify failed:', err));

      return res.json({ 
        success: true, 
        message: 'Authentication successful',
        token: 'fbt_admin_auth_' + Date.now()
      });
    }

    res.status(401).json({ success: false, message: 'Invalid Admin Key' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// ==========================================
// 1. JOB & INTERNSHIP OPPORTUNITIES
// ==========================================

// AI Job Description Generator
apiRouter.post('/jobs/generate-description', async (req, res) => {
  try {
    const { title, type, keyContext, duration, workMode, location } = req.body;
    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and Type are required for description generation' });
    }

    const description = await generateJobDescriptionAI({
      title,
      type,
      keyContext: keyContext || '',
      duration: duration || '',
      workMode: workMode || 'Remote',
      location: location || ''
    });

    res.json({ success: true, description });
  } catch (error) {
    console.error('Error generating AI job description:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI description', error: error.message });
  }
});

// Create a new Job or Internship Posting
apiRouter.post('/jobs', async (req, res) => {
  try {
    const { 
      type, 
      title, 
      keyContext, 
      description, 
      duration, 
      workMode, 
      location,
      customJobId 
    } = req.body;

    if (!type || !title || !description || !workMode) {
      return res.status(400).json({ success: false, message: 'Missing required fields (type, title, description, workMode)' });
    }

    if ((workMode === 'Onsite' || workMode === 'Hybrid') && !location) {
      return res.status(400).json({ success: false, message: 'Location is required for Onsite and Hybrid positions' });
    }

    const jobId = customJobId?.trim() || generateUniqueJobId(type);

    const collection = await getCollection('jobs');

    // Check uniqueness of jobId
    const existing = await collection.findOne({ jobId });
    const finalJobId = existing ? `${jobId}-${Math.floor(Math.random() * 1000)}` : jobId;

    const newJob = {
      jobId: finalJobId,
      type, // 'Job' | 'Internship'
      title,
      keyContext: keyContext || '',
      description,
      duration: duration || (type === 'Internship' ? '3-6 Months' : 'Full Time'),
      workMode, // 'Onsite' | 'Remote' | 'Hybrid'
      location: (workMode === 'Remote' && !location) ? 'Remote (India / Global)' : (location || 'Nellore, Andhra Pradesh'),
      status: 'Active', // 'Active' | 'Closed' | 'Draft'
      applicationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newJob);

    res.status(201).json({ 
      success: true, 
      message: `${type} opportunity created successfully`,
      data: { ...newJob, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating job opportunity:', error);
    res.status(500).json({ success: false, message: 'Internal server error creating job opportunity', error: error.message });
  }
});

// Get all Jobs / Internships
apiRouter.get('/jobs', async (req, res) => {
  try {
    const { type, status, workMode } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (status && status !== 'All') filter.status = status;
    if (workMode && workMode !== 'All') filter.workMode = workMode;

    const collection = await getCollection('jobs');
    const jobs = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching jobs', error: error.message });
  }
});

// Get single job by ID or jobId
apiRouter.get('/jobs/:idOrJobId', async (req, res) => {
  try {
    const { idOrJobId } = req.params;
    const collection = await getCollection('jobs');

    let job = null;
    if (ObjectId.isValid(idOrJobId)) {
      job = await collection.findOne({ _id: new ObjectId(idOrJobId) });
    }
    if (!job) {
      job = await collection.findOne({ jobId: idOrJobId });
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opportunity not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: 'Error retrieving job details', error: error.message });
  }
});

// Update Job / Internship
apiRouter.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body, updatedAt: new Date() };
    delete updateFields._id;

    const collection = await getCollection('jobs');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Error updating job', error: error.message });
  }
});

// Delete Job / Internship
apiRouter.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('jobs');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Error deleting job', error: error.message });
  }
});

// ==========================================
// 2. 3-STAGE JOB & INTERNSHIP APPLICATIONS
// ==========================================

// Submit 3-stage candidate application
apiRouter.post('/job-applications', upload.single('resume'), async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      jobType,
      // Stage 1: Basic Details
      name,
      email,
      phone,
      location,
      // Stage 2: Educational background & Experience
      highestQualification,
      collegeName,
      sector,
      placeOfEducation,
      score,
      yearOfCompletion,
      jobExperienceDetails,
      // Stage 3: Self declaration
      gender,
      dob,
      agreedTerms
    } = req.body;

    if (!name || !email || !phone || !jobId) {
      return res.status(400).json({ success: false, message: 'Missing essential application fields' });
    }

    const appId = `APP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newApplication = {
      applicationId: appId,
      jobId,
      jobTitle: jobTitle || 'Future Bound Tech Role',
      jobType: jobType || 'Job',
      // Stage 1
      name,
      email,
      phone,
      location: location || '',
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      // Stage 2
      highestQualification: highestQualification || '',
      collegeName: collegeName || '',
      sector: sector || '',
      placeOfEducation: placeOfEducation || '',
      score: score || '',
      yearOfCompletion: yearOfCompletion || '',
      jobExperienceDetails: jobExperienceDetails || 'Fresher / Entry Level',
      // Stage 3
      gender: gender || 'Not Specified',
      dob: dob || '',
      agreedTerms: agreedTerms === 'true' || agreedTerms === true,
      // Pipeline Status
      status: 'Applied', // 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Hired' | 'Dropped'
      offerDetails: null,
      statusHistory: [
        {
          status: 'Applied',
          updatedAt: new Date(),
          notes: 'Candidate submitted 3-stage application.'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const appsCollection = await getCollection('job_applications');
    const result = await appsCollection.insertOne(newApplication);

    // Increment applicant count on the Job
    try {
      const jobsCol = await getCollection('jobs');
      await jobsCol.updateOne({ jobId }, { $inc: { applicationsCount: 1 } });
    } catch (countErr) {
      console.warn('Count increment notice:', countErr.message);
    }

    // Auto-dispatch confirmation email to candidate and notification to admin
    handleJobApplicationEmails(newApplication).catch(e => console.error('Job application email dispatch error:', e));

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Confirmation email dispatched.',
      applicationId: appId,
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error submitting job application:', error);
    res.status(500).json({ success: false, message: 'Internal server error submitting application', error: error.message });
  }
});

// Get all job applications with filtering
apiRouter.get('/job-applications', async (req, res) => {
  try {
    const { jobId, status, search } = req.query;
    const filter = {};
    if (jobId && jobId !== 'All') filter.jobId = jobId;
    if (status && status !== 'All') filter.status = status;

    const collection = await getCollection('job_applications');
    let applications = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    if (search) {
      const q = search.toLowerCase();
      applications = applications.filter(a => 
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q) ||
        a.collegeName?.toLowerCase().includes(q) ||
        a.applicationId?.toLowerCase().includes(q) ||
        a.jobId?.toLowerCase().includes(q) ||
        a.jobTitle?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
});

// Update Application Status (Applied -> Shortlisted -> Interview Scheduled -> Hired -> Dropped)
apiRouter.put('/job-applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate, interviewTime, interviewLink, offerId, joiningDate, compensation } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const appsCollection = await getCollection('job_applications');
    const application = await appsCollection.findOne({ _id: new ObjectId(id) });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let finalOfferId = offerId;
    let offerRecord = application.offerDetails || null;

    // If candidate is Hired, generate or assign unique Offer ID and save to offers collection
    if (status === 'Hired') {
      if (!finalOfferId) {
        finalOfferId = generateUniqueOfferId(application.jobType);
      }

      offerRecord = {
        offerId: finalOfferId,
        candidateName: application.name,
        candidateEmail: application.email,
        jobTitle: application.jobTitle,
        jobType: application.jobType,
        jobId: application.jobId,
        joiningDate: joiningDate || 'Immediate',
        compensation: compensation || 'Competitive / Performance Stipend',
        issuedAt: new Date(),
        status: 'Verified & Active'
      };

      try {
        const offersCol = await getCollection('offers');
        await offersCol.updateOne(
          { offerId: finalOfferId },
          { $set: offerRecord },
          { upsert: true }
        );
      } catch (offErr) {
        console.warn('Offer collection upsert notice:', offErr.message);
      }
    }

    const statusEntry = {
      status,
      updatedAt: new Date(),
      notes: notes || `Status updated to ${status}`,
      details: { interviewDate, interviewTime, interviewLink, offerId: finalOfferId, joiningDate, compensation }
    };

    const updateDoc = {
      $set: {
        status,
        offerDetails: offerRecord,
        updatedAt: new Date()
      },
      $push: {
        statusHistory: statusEntry
      }
    };

    await appsCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);

    const updatedApp = { ...application, status, offerDetails: offerRecord };

    // Auto-send automated email to candidate
    handleApplicationStatusEmail({
      application: updatedApp,
      newStatus: status,
      details: { interviewDate, interviewTime, interviewLink, offerId: finalOfferId, joiningDate, compensation }
    }).catch(e => console.error('Status change email notify error:', e));

    // Prepare manual copyable email template for admin
    const manualTemplate = prepareManualEmailTemplate({
      application: updatedApp,
      status,
      details: { interviewDate, interviewTime, interviewLink, offerId: finalOfferId, joiningDate, compensation }
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}. Automated notification email sent!`,
      offerId: finalOfferId,
      manualTemplate
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Error updating application status', error: error.message });
  }
});

// Delete job application
apiRouter.delete('/job-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('job_applications');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ success: false, message: 'Error deleting application', error: error.message });
  }
});

// ==========================================
// 3. OFFER LETTER / CERTIFICATE VERIFICATION
// ==========================================

// Verify Offer by unique ID (e.g. FBT-01I-A101)
apiRouter.get('/offers/verify/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const cleanId = offerId.trim();

    const offersCol = await getCollection('offers');
    let offer = await offersCol.findOne({ 
      offerId: { $regex: new RegExp(`^${cleanId}$`, 'i') } 
    });

    if (!offer) {
      // Check in job applications if not yet synced
      const appsCol = await getCollection('job_applications');
      const appWithOffer = await appsCol.findOne({
        'offerDetails.offerId': { $regex: new RegExp(`^${cleanId}$`, 'i') }
      });
      if (appWithOffer && appWithOffer.offerDetails) {
        offer = appWithOffer.offerDetails;
      }
    }

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: `No active Offer Letter found matching Offer ID: "${cleanId}". Please verify the ID or contact HR at info@futureboundtech.online.` 
      });
    }

    res.json({
      success: true,
      data: {
        offerId: offer.offerId,
        candidateName: offer.candidateName,
        candidateEmail: offer.candidateEmail ? `${offer.candidateEmail.substring(0, 3)}***@${offer.candidateEmail.split('@')[1] || ''}` : '',
        jobTitle: offer.jobTitle,
        jobType: offer.jobType,
        jobId: offer.jobId,
        issuedAt: offer.issuedAt,
        status: offer.status || 'Verified & Authentic',
        organization: 'Future Bound Tech',
        officialSeal: 'VERIFIED_OFFICIAL_FBT'
      }
    });
  } catch (error) {
    console.error('Error verifying offer ID:', error);
    res.status(500).json({ success: false, message: 'Verification server error', error: error.message });
  }
});

// Get all verified offers for Admin
apiRouter.get('/offers', async (req, res) => {
  try {
    const offersCol = await getCollection('offers');
    const offers = await offersCol.find({}).sort({ issuedAt: -1 }).toArray();
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Error fetching offers', error: error.message });
  }
});

// ==========================================
// 4. LEGACY GENERAL CAREER APPLICATIONS
// ==========================================
apiRouter.post('/careers', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, state, city, institute_university, qualification, domain, message } = req.body;

    if (!name || !email || !phone || !domain) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const collection = await getCollection('careers');
    const newApplication = {
      name,
      email,
      phone,
      state: state || '',
      city: city || '',
      institute_university: institute_university || '',
      qualification: qualification || '',
      domain,
      message: message || '',
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      status: 'New',
      createdAt: new Date()
    };

    const result = await collection.insertOne(newApplication);
    handleCareerEmails(newApplication).catch(e => console.error('Career email error:', e));

    res.status(201).json({ 
      success: true, 
      message: 'Career application saved successfully to MongoDB', 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error saving career application:', error);
    res.status(500).json({ success: false, message: 'Internal server error saving to MongoDB', error: error.message });
  }
});

apiRouter.get('/careers', async (req, res) => {
  try {
    const collection = await getCollection('careers');
    const applications = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
});

apiRouter.delete('/careers/:id', async (req, res) => {
  try {
    const collection = await getCollection('careers');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting application', error: error.message });
  }
});

// ==========================================
// 5. CONTACT INQUIRIES
// ==========================================
apiRouter.post('/contacts', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const collection = await getCollection('contacts');
    const newContact = {
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      status: 'New',
      createdAt: new Date()
    };

    const result = await collection.insertOne(newContact);
    handleContactEmails(newContact).catch(e => console.error('Contact email error:', e));

    res.status(201).json({ 
      success: true, 
      message: 'Contact inquiry saved successfully to MongoDB', 
      id: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

apiRouter.get('/contacts', async (req, res) => {
  try {
    const collection = await getCollection('contacts');
    const contacts = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
  }
});

apiRouter.delete('/contacts/:id', async (req, res) => {
  try {
    const collection = await getCollection('contacts');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact', error: error.message });
  }
});

// ==========================================
// 6. APPOINTMENTS
// ==========================================
apiRouter.post('/appointments', async (req, res) => {
  try {
    const { client_name, client_email, appointment_date, appointment_time, service_type } = req.body;

    if (!client_name || !client_email || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Missing required appointment fields' });
    }

    const collection = await getCollection('appointments');
    const existing = await collection.findOne({ appointment_date, appointment_time });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: `Time slot ${appointment_time} on ${appointment_date} is already booked. Please choose another slot.` 
      });
    }

    const newAppointment = {
      client_name,
      client_email,
      appointment_date,
      appointment_time,
      service_type: service_type || 'Software Development',
      meet_link: STATIC_MEET_LINK,
      status: 'Confirmed',
      bookedAt: new Date()
    };

    const result = await collection.insertOne(newAppointment);
    handleAppointmentEmails(newAppointment).catch(e => console.error('Appointment email error:', e));

    res.status(201).json({ 
      success: true, 
      message: 'Appointment reserved successfully', 
      id: result.insertedId,
      meet_link: STATIC_MEET_LINK
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error booking appointment', error: error.message });
  }
});

apiRouter.get('/appointments', async (req, res) => {
  try {
    const { date } = req.query;
    const collection = await getCollection('appointments');

    if (date) {
      const appointments = await collection.find({ appointment_date: date }).toArray();
      const bookedSlots = appointments.map(a => a.appointment_time);
      return res.json({ 
        success: true, 
        date, 
        bookedSlots, 
        count: appointments.length, 
        appointments 
      });
    }

    const allAppointments = await collection.find({}).sort({ appointment_date: 1, appointment_time: 1 }).toArray();
    res.json({ success: true, count: allAppointments.length, data: allAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
});

apiRouter.delete('/appointments/:id', async (req, res) => {
  try {
    const collection = await getCollection('appointments');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment cancelled/deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting appointment', error: error.message });
  }
});

// ==========================================
// 7. ADMIN CONSOLIDATED DATA
// ==========================================
apiRouter.get('/admin/all', async (req, res) => {
  try {
    const [jobsCol, jobAppsCol, offersCol, careersCol, contactsCol, appointmentsCol] = await Promise.all([
      getCollection('jobs'),
      getCollection('job_applications'),
      getCollection('offers'),
      getCollection('careers'),
      getCollection('contacts'),
      getCollection('appointments')
    ]);

    const [jobs, jobApplications, offers, careers, contacts, appointments] = await Promise.all([
      jobsCol.find({}).sort({ createdAt: -1 }).toArray(),
      jobAppsCol.find({}).sort({ createdAt: -1 }).toArray(),
      offersCol.find({}).sort({ issuedAt: -1 }).toArray(),
      careersCol.find({}).sort({ createdAt: -1 }).toArray(),
      contactsCol.find({}).sort({ createdAt: -1 }).toArray(),
      appointmentsCol.find({}).sort({ createdAt: -1 }).toArray()
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        jobApplications,
        offers,
        careers,
        contacts,
        appointments,
        stats: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter(j => j.status === 'Active').length,
          totalJobApplications: jobApplications.length,
          totalOffers: offers.length,
          totalCareers: careers.length,
          totalContacts: contacts.length,
          totalAppointments: appointments.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ success: false, message: 'Error fetching admin records', error: error.message });
  }
});

// ==========================================
// 8. DYNAMIC AI REVIEW GENERATION
// ==========================================
apiRouter.get('/reviews/generate', async (req, res) => {
  try {
    const { type = 'student' } = req.query;
    const review = await generateUniqueReviewAI(type);

    try {
      const collection = await getCollection('generated_reviews');
      await collection.insertOne({
        category: type,
        reviewText: review,
        generatedAt: new Date(),
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      });
    } catch (dbErr) {
      // Non-blocking database tracking
    }

    res.json({ success: true, category: type, review });
  } catch (err) {
    console.error('Error generating AI review:', err);
    res.status(500).json({ success: false, message: 'Could not generate review', error: err.message });
  }
});

// ==========================================
// 9. HOSTINGER EMAIL WEBHOOK ENDPOINT
// ==========================================
apiRouter.post('/webhooks/hostinger', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-hostinger-signature'] || req.headers['authorization'] || '';

    console.log('📬 [Hostinger Webhook] Incoming message event received:', {
      event: payload?.event || payload?.type || 'message.received',
      from: payload?.from || payload?.sender || 'Unknown',
      subject: payload?.subject || 'No Subject',
      timestamp: new Date().toISOString()
    });

    // Store incoming email payload in database for logging & analytics
    try {
      const webhookCollection = await getCollection('hostinger_webhooks');
      await webhookCollection.insertOne({
        event: payload?.event || 'message.received',
        payload,
        signature,
        receivedAt: new Date(),
        headers: {
          host: req.headers['host'],
          userAgent: req.headers['user-agent']
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ Could not save webhook event to MongoDB:', dbErr.message);
    }

    return res.status(200).json({ 
      success: true, 
      received: true, 
      message: 'Hostinger webhook received and logged successfully' 
    });
  } catch (error) {
    console.error('❌ Error processing Hostinger webhook:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook', 
      error: error.message 
    });
  }
});

