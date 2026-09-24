import express from 'express';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getCollection } from './db.js';
import { 
  handleCareerEmails, 
  handleAppointmentEmails, 
  handleContactEmails, 
  sendAdminLoginNotification,
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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

      // Send self-notification email via SMTP in background
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
// 1. CAREER APPLICATIONS
// ==========================================

// Submit a new career application
apiRouter.post('/careers', upload.single('resume'), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      state, 
      city, 
      institute_university, 
      qualification, 
      domain, 
      message 
    } = req.body;

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

    // AI & SMTP auto-responder
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

// Get all career applications
apiRouter.get('/careers', async (req, res) => {
  try {
    const collection = await getCollection('careers');
    const applications = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Error fetching career applications:', error);
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
});

// Delete career application
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
// 2. CONTACT INQUIRIES
// ==========================================

// Submit contact form inquiry
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

    // AI & SMTP auto-responder
    handleContactEmails(newContact).catch(e => console.error('Contact email error:', e));

    res.status(201).json({ 
      success: true, 
      message: 'Contact inquiry saved successfully to MongoDB', 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get all contact inquiries
apiRouter.get('/contacts', async (req, res) => {
  try {
    const collection = await getCollection('contacts');
    const contacts = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
  }
});

// Delete contact inquiry
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
// 3. APPOINTMENTS & TIME SLOTS
// ==========================================

// Book an appointment (with collision check & fixed Google Meet link)
apiRouter.post('/appointments', async (req, res) => {
  try {
    const { client_name, client_email, appointment_date, appointment_time, service_type } = req.body;

    if (!client_name || !client_email || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Missing required appointment fields' });
    }

    const collection = await getCollection('appointments');

    // Check if the slot is already booked for that date
    const existing = await collection.findOne({
      appointment_date,
      appointment_time
    });

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

    // AI & SMTP auto-responder
    handleAppointmentEmails(newAppointment).catch(e => console.error('Appointment email error:', e));

    res.status(201).json({ 
      success: true, 
      message: 'Appointment reserved successfully', 
      id: result.insertedId,
      meet_link: STATIC_MEET_LINK
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ success: false, message: 'Error booking appointment', error: error.message });
  }
});

// Get appointments (or filter by date to get booked slots)
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
});

// Delete appointment
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
// 4. ADMIN CONSOLIDATED DATA
// ==========================================
apiRouter.get('/admin/all', async (req, res) => {
  try {
    const [careersCol, contactsCol, appointmentsCol] = await Promise.all([
      getCollection('careers'),
      getCollection('contacts'),
      getCollection('appointments')
    ]);

    const [careers, contacts, appointments] = await Promise.all([
      careersCol.find({}).sort({ createdAt: -1 }).toArray(),
      contactsCol.find({}).sort({ createdAt: -1 }).toArray(),
      appointmentsCol.find({}).sort({ createdAt: -1 }).toArray()
    ]);

    res.json({
      success: true,
      data: {
        careers,
        contacts,
        appointments,
        stats: {
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
