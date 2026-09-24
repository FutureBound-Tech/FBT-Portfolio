import express from 'express';
import cors from 'cors';
import { apiRouter } from './apiRouter.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json());
apiApp.use('/uploads', express.static(path.join(__dirname, 'uploads')));
apiApp.use('/api', apiRouter);
apiApp.use('/', apiRouter);

