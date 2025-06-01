import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';

// This enables file uploads in the API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define a type for the file object
type ProcessedFile = {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
};

type ProcessedFiles = {
  [key: string]: ProcessedFile | ProcessedFile[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  console.log('Test upload API: Headers received:', req.headers);

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = process.env.VERCEL ? '/tmp' : `${process.cwd()}/tmp`;
    if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const formData: { fields: Fields; files: ProcessedFiles } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          return reject(err);
        }
        
        console.log('Form parsed successfully', {
          fields: Object.keys(fields),
          files: Object.keys(files),
        });
        
        // Log detailed file info
        if (files && Object.keys(files).length > 0) {
          const fileDetails = Object.entries(files).map(([key, file]) => {
            // Make sure file exists before trying to access it
            if (!file) {
              return {
                key,
                error: 'File entry is undefined'
              };
            }
            
            // Safely handle the file object whether it's an array or single object
            const fileObj = Array.isArray(file) && file.length > 0 
              ? file[0] 
              : !Array.isArray(file) ? file as ProcessedFile : null;
            
            if (!fileObj) {
              return {
                key,
                error: 'Empty file array or invalid file object'
              };
            }
            
            return {
              key,
              filepath: fileObj.filepath ? 'exists' : 'missing',
              filename: fileObj.originalFilename || 'unnamed',
              mimetype: fileObj.mimetype || 'unknown',
              size: fileObj.size ? `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB` : 'unknown'
            };
          });
          console.log('Files received:', fileDetails);
        }
        
        resolve({ fields, files: files as unknown as ProcessedFiles });
      });
    });

    return res.status(200).json({
      success: true,
      message: 'File upload successful',
      received: {
        fields: Object.keys(formData.fields),
        files: Object.keys(formData.files),
      }
    });
  } catch (error) {
    console.error('Test upload API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 