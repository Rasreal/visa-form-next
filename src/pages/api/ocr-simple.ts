import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields } from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractDocumentData } from '../../utils/ocr';
import { supabase } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Simplified OCR API that doesn't rely on database operations
 * Use this as a fallback on the deployed server
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Simple OCR API: Received request with method:', req.method);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET requests - for retrieving OCR data by agentId
  if (req.method === 'GET') {
    const agentIdParam = req.query.agentId;
    if (!agentIdParam) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing agentId parameter' 
      });
    }
    
    const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;
    
    try {
      console.log('Fetching OCR data for agent ID:', agentId);
      
      // Fetch the latest OCR processing data for this agent
      const { data, error } = await supabase
        .from('ocr_processing_history')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No OCR data found for agent ID:', agentId);
        return res.status(200).json({
          success: true,
          message: 'No OCR data found for this agent ID',
          data: null
        });
      }
      
      console.log('Found OCR data for agent ID:', agentId);
      return res.status(200).json({
        success: true,
        data: data[0]
      });
    } catch (error) {
      console.error('Error fetching OCR data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve OCR data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Continue with POST handling
  if (req.method !== 'POST') {
    console.error(`Simple OCR API: Method ${req.method} not allowed`);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  console.log('Simple OCR API: Processing file upload request, headers:', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });

  try {

    const isVercel = process.env.VERCEL === 'true';

    // Modified form configuration for serverless environment compatibility
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
      maxFileSize: MAX_FILE_SIZE,
      allowEmptyFiles: false,
      // Use system temp directory for serverless compatibility (Vercel)
      uploadDir: isVercel ? '/tmp' : path.join(process.cwd(), 'tmp'),
      filename: (_name, _ext, part) => {
        // Generate unique filename to avoid conflicts
        const uniqueFilename = `${Date.now()}-${uuidv4()}`;
        const ext = part.mimetype?.split('/').pop() || 'jpg';
        return `${uniqueFilename}.${ext}`;
      }
    });

    // Only create tmp directory in local development, not in serverless environment
    if (!isVercel) {
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    }

    console.log('Parsing form data...');
    const formData: { fields: Fields; files: ProcessedFiles } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          return reject(err);
        }
        
        const fileKeys = Object.keys(files);
        console.log('Form parsed successfully, file keys:', fileKeys);
        
        if (fileKeys.length === 0) {
          return reject(new Error('No files found in the form data'));
        }
        
        resolve({ fields, files: files as unknown as ProcessedFiles });
      });
    });

    // Generate or use agent ID
    const agentIdParam = req.cookies.agentId || req.query.agentId;
    const agentId = typeof agentIdParam === 'string' ? agentIdParam :
                    Array.isArray(agentIdParam) ? agentIdParam[0] :
                    uuidv4();

    console.log('Using agent ID:', agentId);

    const fileKey = Object.keys(formData.files)[0];
    if (!fileKey) {
      console.error('Simple OCR API: No file found in upload');
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
      console.error('Simple OCR API: Invalid file or filepath');
      return res.status(400).json({
        success: false,
        error: 'Invalid file upload',
        message: 'The uploaded file is invalid or cannot be processed'
      });
    }

    // Try to determine file type from extension if MIME type is generic
    const fileType = getFileType(file);
    console.log('Detected file type:', fileType);

    // Validate file type - be more permissive
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      console.error('Simple OCR API: Invalid file type', { mimetype: fileType });

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
      // Extract document data using OCR directly from filepath
      console.log('Processing document with OCR...');
      const extractedData = await extractDocumentData(file.filepath, fileType);
      console.log('OCR extraction complete');

      // Generate a fake file path since we're not actually storing the file
      const fakePath = `${agentId}/${uuidv4()}-${file.originalFilename || 'document.jpg'}`;

      console.log('File path:', fakePath);
      console.log('File exists?', fs.existsSync(fakePath));


      // Insert the OCR data into the database
      console.log('Inserting OCR data into database...');
      const { data: insertedData, error: insertError } = await supabase
        .from('ocr_processing_history')
        .insert({
          agent_id: agentId,
          document_type: 'passport',
          document_path: fakePath,
          processing_status: 'success',
          extracted_data: extractedData || {},
          created_at: new Date().toISOString()
        })
        .select();

      // Handle database insertion errors
      if (insertError) {
        console.error('Database insertion error:', insertError);
        console.log('Database error details:', {
          errorMessage: insertError.message,
          errorCode: insertError.code,
          errorDetails: insertError.details,
          errorHint: insertError.hint
        });
        
        // Clean up temp file
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file after database error:', cleanupError);
        }
        
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to save OCR data to database',
          details: insertError.message
        });
      }
      
      console.log('OCR data successfully inserted into database:', 
        insertedData ? `ID: ${insertedData[0]?.id}` : 'No ID returned');

      // Save to the new ocr_data table
      console.log('Saving OCR data to ocr_data table...');
      const { data: ocrData, error: ocrDataError } = await supabase.from('ocr_data').insert({
        agent_id: agentId,
        document_type: fileKey, // Using the document type from the file upload field name
        document_path: fakePath,
        passport_number: extractedData.passportNumber,
        name: extractedData.name,
        surname: extractedData.surname,
        date_of_birth: extractedData.dateOfBirth,
        citizenship: extractedData.citizenship,
        passport_issue_date: extractedData.passportIssueDate,
        passport_expiry_date: extractedData.passportExpiryDate,
        iin: extractedData.iin,
        id_number: extractedData.idNumber,
        gender: extractedData.gender,
        nationality: extractedData.nationality,
        birth_place: extractedData.birthPlace,
        raw_text: extractedData.rawText
      }).select();

      if (ocrDataError) {
        console.warn('Failed to save OCR data to ocr_data table:', ocrDataError);
        console.log('Database error details:', {
          errorMessage: ocrDataError.message,
          errorCode: ocrDataError.code,
          errorDetails: ocrDataError.details,
          errorHint: ocrDataError.hint
        });
        // Continue anyway - don't fail the whole upload because of database logging issues
      } else {
        console.log('Successfully saved OCR data to ocr_data table', 
          ocrData ? `ID: ${ocrData[0]?.id}` : 'No ID returned');
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
        filePath: fakePath,
        agentId,
        message: 'Document processed successfully and data saved to database'
      });
    } catch (fileError) {
      console.error('File processing error:', fileError);

      // Try to log the error to the database for tracking
      try {
        await supabase.from('ocr_processing_history').insert({
          agent_id: agentId || 'unknown',
          document_type: 'passport',
          document_path: 'failed_upload',
          processing_status: 'error',
          error_message: fileError instanceof Error ? fileError.message : 'Unknown file processing error',
          created_at: new Date().toISOString()
        });
        console.log('Error logged to database');
        
        // Also log to ocr_data table
        await supabase.from('ocr_data').insert({
          agent_id: agentId || 'unknown',
          document_type: fileKey || 'unknown',
          document_path: 'failed_upload',
          raw_text: fileError instanceof Error ? fileError.message : 'Unknown file processing error',
          created_at: new Date().toISOString()
        });
        console.log('Error logged to ocr_data table');
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
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
    console.error('Simple OCR API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler; 