import express, { json } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

import StorageManager from './src/components/storage.manager.js';

const PORT = process.env.PORT || 3000;
const storageProvider = process.env.STORAGE_PROVIDER;


app.use(json());

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});