import express, { json } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

import StorageManager from './src/components/storage.manager.js';

const PORT = process.env.PORT || 3000;
const storageProvider = process.env.STORAGE_PROVIDER;
const allowedHost = [process.env.ALLOWED_HOST];


app.use(json());
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || null;
  
  if (!clientIp || !allowedHost.includes(clientIp)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
});

// Import the StorageManager class
const storageManager = new StorageManager(storageProvider);

// POST /files endpoint
app.post('/files', async (req, res) => {
    return await storageManager.uploadFile(req, res);
});

//GET /files endpoint
app.get('/files/:publicKey', async (req, res) => {
    return await storageManager.downloadFile(req, res);
});

app.get('/', async (req, res) => {
  return res.status(200).json(
    {
      message: 'Welcome to the File Storage API',
      endpoints: [
        { method: 'POST', path: '/files', description: 'Upload a file' },
        { method: 'GET', path: '/files/:publicKey', description: 'Download a file' },
      ],
    }
  );
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3000');
});
