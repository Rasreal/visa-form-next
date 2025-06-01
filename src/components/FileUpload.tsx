import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ExtractedDocumentData } from '../utils/ocr';
import Cookies from 'js-cookie';

interface FileUploadProps {
  onExtract: (data: ExtractedDocumentData, filePath?: string) => void;
  label: string;
  name: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  deployedMode?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onExtract,
  label,
  name,
  maxSizeMB = 10,
  deployedMode = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // onDrop callback for handling file uploads
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        setError('Не выбран файл для загрузки');
        return;
      }

      // Validate file before uploading
      const validateFile = (file: File): string | null => {
        // Log file information for debugging
        console.log('File info:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });

        // Check file size (convert MB to bytes)
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          return `Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`;
        }

        // For empty or incorrect MIME types, try to detect from extension
        let fileType = file.type;
        if (!fileType || fileType === 'application/octet-stream') {
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension === 'jpg' || extension === 'jpeg') {
            fileType = 'image/jpeg';
          } else if (extension === 'png') {
            fileType = 'image/png';
          } else if (extension === 'pdf') {
            fileType = 'application/pdf';
          } else if (extension === 'heic' || extension === 'heif') {
            fileType = 'image/heic';
          } else if (extension === 'bmp') {
            fileType = 'image/bmp';
          }
        }

        // Validate file type more permissively
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/bmp', 'image/heic'];
        const validPdfTypes = ['application/pdf'];

        if (validImageTypes.includes(fileType) || validPdfTypes.includes(fileType)) {
          return null; // Valid file type
        }

        return `Неподдерживаемый тип файла (${fileType}). Разрешены: JPG, PNG, PDF`;
      };

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);
      setError(null);
      setUploadedFile(file);

      try {
        // Get agent ID from localStorage or cookies
        const getAgentId = () => {
          // First try localStorage
          const localStorageAgentId = localStorage.getItem('agentId');
          if (localStorageAgentId) {
            return localStorageAgentId;
          }

          // Then try cookies (for backward compatibility)
          const cookieAgentId = Cookies.get('agentId');
          if (cookieAgentId) {
            // Migrate to localStorage
            localStorage.setItem('agentId', cookieAgentId);
            return cookieAgentId;
          }

          return null;
        };

        const agentId = getAgentId();

        // Ensure the file has a proper name
        const fileName = file.name || `document.${file.type.split('/')[1] || 'jpg'}`;

        // Create a new File object with a guaranteed name if needed
        const fileToUpload = file.name ? file : new File(
          [file],
          fileName,
          { type: file.type || 'image/jpeg' }
        );

        // Log what we're sending
        console.log('Sending to server:', {
          fieldName: name,
          fileName: fileToUpload.name,
          fileType: fileToUpload.type,
          fileSize: `${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB`
        });

        // Upload retry function with proper POST method
        const uploadWithRetry = async (retryCount = 0, maxRetries = 3) => {
          try {
            // Use the simplified endpoint when in deployed mode
            const endpoint = deployedMode ? '/api/ocr-simple' : '/api/ocr';
            // Create URL with agentId as query parameter
            const url = agentId ? `${endpoint}?agentId=${agentId}` : endpoint;
            console.log(`Uploading to ${url}, attempt ${retryCount + 1}/${maxRetries + 1}...`);
            
            // Create a fresh FormData for each attempt
            const formData = new FormData();
            formData.append(name, fileToUpload);
            
            // Make POST request with FormData - DO NOT set Content-Type header
            const response = await fetch(url, {
              method: 'POST',
              body: formData,
            });
            
            // Check if response is not JSON
            const contentType = response.headers.get('content-type');
            
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Server returned non-JSON response type:', contentType);
              
              // Get the response text to see what went wrong
              const responseText = await response.text();
              console.error('Non-JSON response body excerpt:', responseText.substring(0, 200) + '...');
              
              // For HTML responses, try to extract error message
              let errorMessage = 'Server returned non-JSON response';
              if (responseText.includes('<title>')) {
                const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                  errorMessage = `Server error: ${titleMatch[1]}`;
                }
              }
              
              // If we have retries left, try again after a delay
              if (retryCount < maxRetries) {
                console.log(`Retrying upload (${retryCount + 2}/${maxRetries + 1}) after delay...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return uploadWithRetry(retryCount + 1, maxRetries);
              }
              
              throw new Error(errorMessage);
            }
            
            // Parse JSON response
            const result = await response.json();
            
            // Log the full response for debugging
            console.log('Full OCR API response:', JSON.stringify(result));
            
            // Consider a response successful if:
            // 1. response.ok is true (status 200-299) AND result.success is true
            // 2. OR we have a filePath (file was uploaded successfully)
            // This handles cases where the file upload worked but database operations might fail
            const isSuccessful = (response.ok && result.success) || 
                                (result.filePath && result.filePath.length > 0);
                                
            if (!isSuccessful && result.message !== "No OCR data found for this agent ID") {
              console.error('Upload failed:', result);
              
              // If we have retries left, try again after a delay
              if (retryCount < maxRetries) {
                console.log(`Retrying upload (${retryCount + 2}/${maxRetries + 1}) after error...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return uploadWithRetry(retryCount + 1, maxRetries);
              }
              
              throw new Error(result.message || `Upload failed with status ${response.status}`);
            }
            
            // Return the result even if it's a "No OCR data found" message
            // The caller will handle it appropriately
            return result;
          } catch (err) {
            // If we have retries left, try again after a delay
            if (retryCount < maxRetries) {
              console.log(`Retrying upload (${retryCount + 2}/${maxRetries + 1}) after error:`, err);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return uploadWithRetry(retryCount + 1, maxRetries);
            }
            
            throw err;
          }
        };
        
        // Execute the upload with retry logic
        console.log('Sending file to OCR server:', fileToUpload.name);
        
        const result = await uploadWithRetry();
        
        console.log('OCR API Response:', {
          success: result.success,
          message: result.message || 'No message',
          hasData: result.data ? 'yes' : 'no',
          hasFilePath: result.filePath ? 'yes' : 'no',
          hasAgentId: result.agentId ? 'yes' : 'no'
        });
        
        // Store the agent ID if it was generated by the server
        if (result.agentId && !agentId) {
          localStorage.setItem('agentId', result.agentId);
          // Also set cookie for backward compatibility
          Cookies.set('agentId', result.agentId, { expires: 7 });
        }

        // Set the uploaded file state and clear any errors
        setUploadedFile(file);
        setError(null);

        // Use empty object as fallback for null/undefined data
        const extractedData = result.data || {};
        const filePath = result.filePath || '';
        
        // Log what we're passing to parent
        console.log('Passing to parent component:', { 
          hasExtractedData: Object.keys(extractedData).length > 0,
          dataFields: Object.keys(extractedData),
          filePath: filePath ? 'exists' : 'missing'
        });
        
        // Pass extracted data and file path to parent component
        onExtract(extractedData, filePath);
      } catch (err) {
        console.error('Error during file upload process:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload and process document');
        console.error('File upload error:', err);
        // Reset the uploaded file on error
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    },
    [name, onExtract, maxSizeMB, deployedMode]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.heic', '.heif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024
  });

  // Show rejection errors
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`);
      } else {
        setError(`Ошибка: ${rejection.errors[0].message}`);
      }
    }
  }, [fileRejections, maxSizeMB]);

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-lg text-center ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        } ${error ? 'border-red-500' : ''} cursor-pointer`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Обработка документа...</p>
          </div>
        ) : uploadedFile ? (
          <div>
            <p className="text-green-600 font-medium">Файл загружен: {uploadedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">Нажмите или перетащите другой файл для замены</p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-gray-600">
              {isDragActive
                ? 'Перетащите файл сюда...'
                : 'Нажмите или перетащите файл для загрузки'}
            </p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF до {maxSizeMB}MB</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
          <p className="font-medium">Ошибка при обработке документа:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;