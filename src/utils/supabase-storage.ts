import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

/**
 * Upload a file to Supabase storage
 * @param fileData File object in browser or Buffer/filepath in Node.js
 * @param agentId Agent ID for folder structure
 * @param documentType Type of document (passport or supporting)
 * @param fileName Original filename (only needed when using Buffer)
 * @param fileType MIME type (only needed when using Buffer)
 */
export const uploadDocumentToStorage = async (
  fileData: File | Buffer | string,
  agentId: string,
  documentType: 'passport' | 'supporting' = 'passport',
  fileName?: string, 
  fileType?: string
): Promise<{ filePath: string; error: Error | null }> => {
  try {
    if (!fileData) {
      throw new Error('No file data provided');
    }

    const bucketId = documentType === 'passport' ? 'passport_documents' : 'supporting_documents';
    
    // Create a unique file path with the agent ID as a folder
    let finalFileName: string;
    
    // Handle different types of input
    if (typeof fileData === 'string') {
      // Node.js environment with filepath
      if (!fileName) {
        const pathParts = fileData.split('/');
        fileName = pathParts[pathParts.length - 1];
      }
      const fileExt = fileName.split('.').pop() || 'jpg';
      finalFileName = `${uuidv4()}.${fileExt}`;
      
      // Instead of using createReadStream, directly read the file into a Buffer
      const buffer = fs.readFileSync(fileData);
      
      const filePath = `${agentId}/${finalFileName}`;
      
      // Upload using buffer instead of stream 
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileType || 'application/octet-stream'
        });
        
      if (error) throw error;
      
      return { 
        filePath: data?.path ?? filePath, 
        error: null 
      };
    } else if (Buffer.isBuffer(fileData)) {
      // Node.js environment with Buffer
      if (!fileName) {
        throw new Error('Filename is required when using Buffer data');
      }
      const fileExt = fileName.split('.').pop() || 'jpg';
      finalFileName = `${uuidv4()}.${fileExt}`;
      
      const filePath = `${agentId}/${finalFileName}`;
      
      // Upload with proper content type
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileType || 'application/octet-stream'
        });
        
      if (error) throw error;
      
      return { 
        filePath: data?.path ?? filePath, 
        error: null 
      };
    } else {
      // Browser environment with File
      const file = fileData as File;
      const fileExt = file.name.split('.').pop() || 'jpg';
      finalFileName = `${uuidv4()}.${fileExt}`;
      
      const filePath = `${agentId}/${finalFileName}`;
      
      // Upload with proper content type
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });
        
      if (error) throw error;
      
      return { 
        filePath: data?.path ?? filePath, 
        error: null 
      };
    }
  } catch (error) {
    console.error('Error uploading file to Supabase storage:', error);
    return { 
      filePath: '', 
      error: error instanceof Error ? error : new Error('Unknown error during file upload') 
    };
  }
};

/**
 * Get a public URL for a file in Supabase storage
 */
export const getDocumentPublicUrl = (
  filePath: string,
  documentType: 'passport' | 'supporting' = 'passport'
): string => {
  const bucketId = documentType === 'passport' ? 'passport_documents' : 'supporting_documents';
  
  const { data } = supabase.storage
    .from(bucketId)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Get all documents uploaded by an agent
 */
export const getAgentDocuments = async (
  agentId: string,
  documentType: 'passport' | 'supporting' = 'passport'
): Promise<{ files: string[]; error: Error | null }> => {
  try {
    const bucketId = documentType === 'passport' ? 'passport_documents' : 'supporting_documents';
    
    const { data, error } = await supabase.storage
      .from(bucketId)
      .list(agentId, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;
    
    const files = data.map(file => `${agentId}/${file.name}`);
    return { files, error: null };
  } catch (error) {
    console.error('Error getting agent documents:', error);
    return { 
      files: [], 
      error: error instanceof Error ? error : new Error('Unknown error getting documents') 
    };
  }
};

/**
 * Delete a document from Supabase storage
 */
export const deleteDocument = async (
  filePath: string,
  documentType: 'passport' | 'supporting' = 'passport'
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const bucketId = documentType === 'passport' ? 'passport_documents' : 'supporting_documents';
    
    const { error } = await supabase.storage
      .from(bucketId)
      .remove([filePath]);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error deleting document') 
    };
  }
}; 