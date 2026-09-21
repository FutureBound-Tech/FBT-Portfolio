import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './apiRouter.js';
import { connectToDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Attach API Routes
app.use('/api', apiRouter);
// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend in production if built
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
