import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields } from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractDocumentData } from '../../utils/ocr';
import { supabase } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocumentToStorage } from '../../utils/supabase-storage';

// This enables file uploads in the API route by disabling the built-in body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFile = {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
};

type ProcessedFiles = {
  [key: string]: ProcessedFile | ProcessedFile[];
};

// Allowed MIME types - expanded list to be more permissive
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/bmp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/octet-stream', // For browsers that don't provide a specific MIME type
];

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Helper to get the correct file type
const getFileType = (file: ProcessedFile): string => {
  // Use mimetype if it exists
  if (file.mimetype) {
    return file.mimetype;
  }

  // Try to determine from filename
  if (file.originalFilename) {
    const extension = path.extname(file.originalFilename).toLowerCase();
    if (['.jpg', '.jpeg'].includes(extension)) {
      return 'image/jpeg';
    } else if (extension === '.png') {
      return 'image/png';
    } else if (extension === '.pdf') {
      return 'application/pdf';
    } else if (['.heic', '.heif'].includes(extension)) {
      return 'image/heic';
    } else if (extension === '.bmp') {
      return 'image/bmp';
    }
  }

  // Default to jpeg if we can't determine
  return 'image/jpeg';
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('OCR API: Received request with method:', req.method);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.error(`OCR API: Method ${req.method} not allowed`);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  console.log('OCR API: Processing file upload request, headers:', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });

  try {
    // Modified form configuration for serverless environment compatibility
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
      maxFileSize: MAX_FILE_SIZE,
      allowEmptyFiles: false,
      // Use system temp directory for serverless compatibility (Vercel)
      uploadDir: process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp'),
      filename: (_name, _ext, part) => {
        // Generate unique filename to avoid conflicts
        const uniqueFilename = `${Date.now()}-${uuidv4()}`;
        const ext = part.mimetype?.split('/').pop() || 'jpg';
        return `${uniqueFilename}.${ext}`;
      }
    });

    // Only create tmp directory in local development, not in serverless environment
    if (!process.env.VERCEL) {
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    }

    console.log('Parsing form data...');
    const formData: { fields: Fields; files: ProcessedFiles } = await new Promise((resolve, reject) => {
      let attemptCount = 0;
      const maxAttempts = 3;
      
      const attemptParse = () => {
        attemptCount++;
        console.log(`Form parsing attempt ${attemptCount}...`);
        
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error(`Form parsing error (attempt ${attemptCount}):`, err);
            if (err.code === 1009) {
              return reject(new Error(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
            }
            
            // If we haven't reached max attempts, try again
            if (attemptCount < maxAttempts) {
              console.log(`Retrying form parse (attempt ${attemptCount + 1})...`);
              setTimeout(attemptParse, 1000); // Wait 1 second before retrying
              return;
            }
            
            return reject(err);
          }
  
          // Log detailed information about parsed files
          const fileKeys = Object.keys(files);
          console.log('Form parsed successfully, file keys:', fileKeys);
  
          if (fileKeys.length === 0) {
            return reject(new Error('No files found in the form data'));
          }
  
          const fileDetails = Object.entries(files).map(([key, file]) => {
            const fileObj = Array.isArray(file) ? file[0] : file;
            return {
              key,
              filepath: fileObj?.filepath || 'missing',
              filename: fileObj?.originalFilename || 'unnamed',
              mimetype: fileObj?.mimetype || 'unknown',
              size: fileObj?.size || 0
            };
          });
  
          console.log('Parsed files details:', JSON.stringify(fileDetails, null, 2));
          resolve({ fields, files: files as unknown as ProcessedFiles });
        });
      };
      
      // Start the first attempt
      attemptParse();
    });

    // Get agent ID from request cookies or query params, ensuring it's a string
    const agentIdParam = req.cookies.agentId || req.query.agentId;
    const agentId = typeof agentIdParam === 'string' ? agentIdParam :
                    Array.isArray(agentIdParam) ? agentIdParam[0] :
                    uuidv4();

    console.log('Using agent ID:', agentId);

    const fileKey = Object.keys(formData.files)[0];
    if (!fileKey) {
      console.error('OCR API: No file found in upload');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'No file was found in the upload'
      });
    }

    // Handle both array and single file formats from formidable
    let file = formData.files[fileKey];
    if (Array.isArray(file)) {
      file = file[0];
    }

    console.log('File received:', {
      filename: file.originalFilename || 'unnamed',
      mimetype: file.mimetype || 'unknown',
      filepath: file.filepath ? 'exists' : 'missing',
      size: file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'unknown'
    });

    // Validate file object and filepath
    if (!file || !file.filepath || !fs.existsSync(file.filepath)) {
      console.error('OCR API: Invalid file or filepath');
      return res.status(400).json({
        success: false,
        error: 'Invalid file upload',
        message: 'The uploaded file is invalid or cannot be processed'
      });
    }

    // Get file stats to verify it exists and has size
    try {
      const stats = fs.statSync(file.filepath);
      console.log('File stats:', {
        size: stats.size,
        isFile: stats.isFile(),
        created: stats.birthtime,
        modified: stats.mtime
      });

      if (!stats.isFile() || stats.size === 0) {
        console.error('OCR API: File is empty or not a file');
        return res.status(400).json({
          success: false,
          error: 'Invalid file',
          message: 'The uploaded file is empty or invalid'
        });
      }
    } catch (statError) {
      console.error('OCR API: Error checking file stats:', statError);
      return res.status(400).json({
        success: false,
        error: 'File stat error',
        message: 'Error verifying the uploaded file'
      });
    }

    // Try to determine file type from extension if MIME type is generic
    const fileType = getFileType(file);
    console.log('Detected file type:', fileType);

    // Validate file type - be more permissive
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      console.error('OCR API: Invalid file type', { mimetype: fileType });

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        message: `File type ${fileType} is not supported. Please upload a JPG, PNG, or PDF file.`
      });
    }

    try {
      // Read file from temporary storage
      console.log('Reading file data...');
      // We don't need to read the file into memory, just use the filepath directly
      console.log('File filepath:', file.filepath);

      // Validate file exists
      if (!fs.existsSync(file.filepath)) {
        throw new Error('File does not exist at provided path');
      }

      // Get file stats to verify size
      const stats = fs.statSync(file.filepath);
      if (stats.size === 0) {
        throw new Error('File data is empty');
      }
      console.log('File size:', stats.size);

      // Create a file name if one doesn't exist
      const fileName = file.originalFilename || `document.${fileType.split('/')[1]}`;

      console.log('Processing document with OCR...');
      // Extract document data using OCR directly from filepath
      const extractedData = await extractDocumentData(file.filepath, fileType);
      console.log('OCR extraction complete');

      // Upload file to Supabase storage using file path directly
      console.log('Uploading to Supabase storage...');
      const { filePath, error: uploadError } = await uploadDocumentToStorage(
        file.filepath,  // Pass the file path directly
        agentId,
        'passport',
        fileName,
        fileType
      );

      if (uploadError) {
        throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
      }
      console.log('File uploaded successfully:', filePath);

      // Log OCR processing to database
      const { error: insertError } = await supabase.from('ocr_processing_history').insert({
        agent_id: agentId,
        document_type: 'passport',
        document_path: filePath,
        processing_status: 'success',
        extracted_data: extractedData,
      });

      if (insertError) {
        console.warn('Failed to log OCR processing:', insertError);
      }

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }

      // Return the extracted data along with the file path
      return res.status(200).json({
        success: true,
        data: extractedData,
        filePath,
        agentId,
        message: 'Document processed successfully'
      });
    } catch (fileError) {
      console.error('File processing error:', fileError);

      // Log OCR processing error to database
      try {
        await supabase.from('ocr_processing_history').insert({
          agent_id: agentId || 'unknown',
          document_type: 'passport',
          document_path: 'failed_upload',
          processing_status: 'error',
          error_message: fileError instanceof Error ? fileError.message : 'Unknown file processing error',
        });
      } catch (logError) {
        console.error('Failed to log OCR error:', logError);
      }

      // Clean up temp file if it exists
      if (file && file.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file after error:', cleanupError);
        }
      }

      return res.status(500).json({
        success: false,
        error: 'File processing error',
        message: fileError instanceof Error ? fileError.message : 'Failed to process the uploaded file'
      });
    }
  } catch (error) {
    console.error('OCR API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler;