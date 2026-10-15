import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './apiRouter.js';
import { getCollection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json({ limit: '25mb' }));

const localUploadsDir = path.join(__dirname, 'uploads');
const tmpUploadsDir = path.join(os.tmpdir(), 'resumes');
const tmpOffersDir = path.join(os.tmpdir(), 'offers');

// 1. Static file serving for uploads directory
apiApp.use('/uploads', express.static(localUploadsDir));
apiApp.use('/uploads/resumes', express.static(tmpUploadsDir));
apiApp.use('/uploads/offers', express.static(path.join(localUploadsDir, 'offers')));
apiApp.use('/uploads/offers', express.static(tmpOffersDir));

// 2. Specific resume fetch route with disk, tmp, MongoDB persistence check & intelligent candidate fallback
const serveResumeFile = async (req, res) => {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ success: false, message: 'Filename required' });
  }

  // Extract base filename without timestamp prefixes (e.g. 1791390309296-390313518-Masthan.pdf -> Masthan.pdf)
  const parts = filename.split('-');
  const baseName = parts.length > 2 ? parts.slice(2).join('-') : filename;
  const resumeUrlPath = `/uploads/resumes/${filename}`;

  // A. Check local disk for exact filename
  const localFilePath = path.join(localUploadsDir, 'resumes', filename);
  if (fs.existsSync(localFilePath)) {
    return res.sendFile(localFilePath);
  }

  // B. Check local disk for matching baseName
  try {
    const resumesDir = path.join(localUploadsDir, 'resumes');
    if (fs.existsSync(resumesDir)) {
      const diskFiles = fs.readdirSync(resumesDir);
      const matchedDiskFile = diskFiles.find(f => f === filename || f.endsWith(baseName) || (baseName.length > 5 && f.toLowerCase().includes(baseName.toLowerCase())));
      if (matchedDiskFile) {
        return res.sendFile(path.join(resumesDir, matchedDiskFile));
      }
    }
  } catch (dErr) {
    console.warn('Disk scan notice:', dErr.message);
  }

  // C. Check serverless temporary upload directory
  const tmpFilePath = path.join(tmpUploadsDir, filename);
  if (fs.existsSync(tmpFilePath)) {
    return res.sendFile(tmpFilePath);
  }

  // D. Search MongoDB collections for stored resume (Base64/Binary)
  let candidateDoc = null;
  try {
    // 1. Check resumes collection
    const resumesCol = await getCollection('resumes');
    let resumeDoc = await resumesCol.findOne({
      $or: [
        { filename: filename },
        { baseName: baseName },
        { resumeUrl: resumeUrlPath },
        { filename: { $regex: baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ]
    });

    if (resumeDoc && resumeDoc.resumeData) {
      const buffer = Buffer.from(resumeDoc.resumeData, 'base64');
      res.setHeader('Content-Type', resumeDoc.resumeMimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }

    // 2. Check job_applications collection
    const appsCol = await getCollection('job_applications');
    candidateDoc = await appsCol.findOne({
      $or: [
        { resumeUrl: resumeUrlPath },
        { resumeFilename: filename },
        { resumeUrl: { $regex: baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ]
    });

    if (candidateDoc && candidateDoc.resumeData) {
      const buffer = Buffer.from(candidateDoc.resumeData, 'base64');
      res.setHeader('Content-Type', candidateDoc.resumeMimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }

    // 3. Check careers collection
    if (!candidateDoc) {
      const careersCol = await getCollection('careers');
      candidateDoc = await careersCol.findOne({
        $or: [
          { resumeUrl: resumeUrlPath },
          { resumeFilename: filename },
          { resumeUrl: { $regex: baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
        ]
      });

      if (candidateDoc && candidateDoc.resumeData) {
        const buffer = Buffer.from(candidateDoc.resumeData, 'base64');
        res.setHeader('Content-Type', candidateDoc.resumeMimeType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        return res.send(buffer);
      }
    }
  } catch (err) {
    console.error('Error fetching resume from DB:', err.message);
  }

  // E. Fallback: If physical file was uploaded prior to DB sync, render candidate application dossier
  if (candidateDoc) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Candidate Application Profile - ${candidateDoc.name}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; margin: 0; display: flex; justify-content: center; }
          .container { max-width: 680px; width: 100%; background: #111827; border: 1px solid #1f293d; border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 20px; color: #fff; }
          .header p { margin: 6px 0 0 0; color: #dbeafe; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .card { background: #1e293b; padding: 14px 16px; border-radius: 10px; border: 1px solid #334155; }
          .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
          .val { font-size: 14px; color: #f1f5f9; font-weight: 600; }
          .val a { color: #38bdf8; text-decoration: none; }
          .notice { background: rgba(59, 130, 246, 0.1); border: 1px solid #1d4ed8; padding: 14px 18px; border-radius: 10px; font-size: 13px; color: #93c5fd; line-height: 1.5; margin-bottom: 24px; }
          .btn-group { display: flex; gap: 12px; }
          .btn { flex: 1; text-align: center; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; }
          .btn-primary { background: #2563eb; color: #fff; }
          .btn-secondary { background: #334155; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Candidate Application Dossier</h1>
            <p>${candidateDoc.jobTitle || candidateDoc.domain || 'Applicant'} • Ref: ${candidateDoc.applicationId || 'Submitted Candidate'}</p>
          </div>

          <div class="notice">
            ℹ️ <strong>Profile Summary Available:</strong> Candidate submitted this application with resume <code>${filename}</code>. Full verified credentials are documented below.
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Candidate Name</div>
              <div class="val">${candidateDoc.name}</div>
            </div>
            <div class="card">
              <div class="label">Contact Email</div>
              <div class="val"><a href="mailto:${candidateDoc.email}">${candidateDoc.email}</a></div>
            </div>
            <div class="card">
              <div class="label">Phone Number</div>
              <div class="val">${candidateDoc.phone || 'N/A'}</div>
            </div>
            <div class="card">
              <div class="label">Location</div>
              <div class="val">${candidateDoc.location || candidateDoc.city || candidateDoc.state || 'India'}</div>
            </div>
            <div class="card">
              <div class="label">Qualification</div>
              <div class="val">${candidateDoc.highestQualification || candidateDoc.qualification || 'N/A'}</div>
            </div>
            <div class="card">
              <div class="label">College / University</div>
              <div class="val">${candidateDoc.collegeName || candidateDoc.institute_university || 'N/A'}</div>
            </div>
            <div class="card">
              <div class="label">Stream / Score</div>
              <div class="val">${candidateDoc.sector || 'General'} (${candidateDoc.score || 'Passing'})</div>
            </div>
            <div class="card">
              <div class="label">Experience</div>
              <div class="val">${candidateDoc.jobExperienceDetails || 'Fresher / Entry Level'}</div>
            </div>
          </div>

          <div class="btn-group">
            <a href="mailto:${candidateDoc.email}?subject=Application Status: ${candidateDoc.jobTitle || 'Future Bound Tech'}" class="btn btn-primary">✉️ Contact Candidate</a>
            <a href="/" class="btn btn-secondary">Admin Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  // F. Return clean 404 page if no record or file exists
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 - Resume Not Found</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #0f172a; color: #f8fafc; }
        .card { text-align: center; padding: 2.5rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #f43f5e; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        a { display: inline-block; padding: 0.65rem 1.25rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 500; }
        a:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Resume File Not Found</h1>
        <p>The requested application resume file (<code>${filename}</code>) was not found on the server.</p>
        <a href="/">Return to Website</a>
      </div>
    </body>
    </html>
  `);
};

apiApp.get('/uploads/resumes/:filename', serveResumeFile);
apiApp.get('/api/uploads/resumes/:filename', serveResumeFile);

// 3. Specific offer letter fetch route with disk, tmp, and MongoDB persistence check
const serveOfferFile = async (req, res) => {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ success: false, message: 'Filename required' });
  }

  // A. Check local disk
  const localFilePath = path.join(localUploadsDir, 'offers', filename);
  if (fs.existsSync(localFilePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.sendFile(localFilePath);
  }

  // B. Check serverless tmp directory
  const tmpFilePath = path.join(tmpOffersDir, filename);
  if (fs.existsSync(tmpFilePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.sendFile(tmpFilePath);
  }

  // C. Search MongoDB offers collection
  try {
    const offersCol = await getCollection('offers');
    const offerDoc = await offersCol.findOne({
      $or: [
        { offerLetterFilename: filename },
        { offerLetterUrl: `/uploads/offers/${filename}` }
      ]
    });
    if (offerDoc && offerDoc.offerLetterData) {
      const buffer = Buffer.from(offerDoc.offerLetterData, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }

    // D. Search MongoDB job_applications collection
    const appsCol = await getCollection('job_applications');
    const appDoc = await appsCol.findOne({
      $or: [
        { 'offerDetails.offerLetterFilename': filename },
        { 'offerDetails.offerLetterUrl': `/uploads/offers/${filename}` }
      ]
    });
    if (appDoc && appDoc.offerDetails?.offerLetterData) {
      const buffer = Buffer.from(appDoc.offerDetails.offerLetterData, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }
  } catch (dbErr) {
    console.warn('⚠️ Database offer file fetch notice:', dbErr.message);
  }

  return res.status(404).send('Offer Letter PDF not found');
};

apiApp.get('/uploads/offers/:filename', serveOfferFile);
apiApp.get('/api/uploads/offers/:filename', serveOfferFile);

// Explicit 404 handler for any unhandled /uploads request so SPA index.html is never served for uploads
apiApp.use('/uploads', (req, res) => {
  res.status(404).json({ success: false, message: 'Upload resource not found' });
});

apiApp.use('/api', apiRouter);
apiApp.use('/', apiRouter);


