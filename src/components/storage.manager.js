import multer from 'multer';
import fs from 'fs';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

import cryptoUtils from '../helper/createKeys.js';
import { s3Client } from '../helper/s3.config.js';
import { generateFilename } from '../helper/generate.file.name.js';

const fileStorageIdentifier = new Map();
const file_path = process.env.FOLDER || 'files/';

class StorageManager {  
  constructor(provider) {    
    this.storage = this.getStorageProvider(provider);
    this.s3Client = s3Client;
    this.provider = provider;
  }

  // Initialize storage based on the provider
  getStorageProvider(provider) {    
    switch (provider) {
      case 'aws':
        return multer.memoryStorage();
      case 'local':
        return multer.diskStorage({
          destination: file_path,
          filename: (req, file, cb) => {
            const name = generateFilename(file);
            file.generatedName = name;
            cb(null, name);
          },
        });
      default:
        throw new Error('Unsupported storage provider');
    }
  }

  async uploadFile(req, res) {
    try {
      if (!existsSync(file_path)) {
        mkdirSync(file_path, { recursive: true });
      }
      const upload = multer({ storage: this.storage }).single('file');
      
      const publicKey = cryptoUtils.createPublicKey();
      const privateKey = cryptoUtils.createPrivateKey();
      
      upload(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        if(this.provider === 'local') {
          fileStorageIdentifier.set(publicKey, req.file.generatedName);
          fileStorageIdentifier.set(privateKey, req.file.generatedName);
        }

        this.provider === 'aws' && await this.uploadFileToAWS(req, res, publicKey, privateKey); 

        res.json({ publicKey, privateKey });
      });
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
  }

  async uploadFileToAWS(req, res, publicKey, privateKey) { 
    try {
      const key = generateFilename(req.file);
      fileStorageIdentifier.set(publicKey, key);
      fileStorageIdentifier.set(privateKey, key);
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      return await s3Client.send(command);
    } catch (s3Error) {
      return res.status(500).json({ error: s3Error.message });
    }
  }

  async downloadFile(req, res) {
    try {
      const { publicKey } = req.params;
      const fileName = fileStorageIdentifier.get(publicKey);
      const filePath = path.join(file_path, fileName);
  
      // Check if the file exists regardless of the provider
      if (this.provider === 'local' && !fs.existsSync(filePath) || !fileName) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (this.provider === 'aws' && !fileName) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      const mimeType = mime.lookup(fileName) || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      switch (this.provider) {
        case 'local':
            fs.createReadStream(filePath).pipe(res);
            break;
        case 'aws':
          const s3Response = await this.downloadFromAWS(fileName, res);
          s3Response.Body.pipe(res);
          break;
        default:
          res.status(400).json({ error: 'Unsupported provider for download' });
      }
    } catch (error) {
      console.error('Error in downloadFile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download file from AWS S3
  async downloadFromAWS(publicKey, res) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: publicKey,
    });
    try {
      return await s3Client.send(command);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default StorageManager;
