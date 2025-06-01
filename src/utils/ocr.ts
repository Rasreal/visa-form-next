import { createWorker } from 'tesseract.js';

export interface ExtractedDocumentData {
  surname?: string;
  name?: string;
  dateOfBirth?: string;
  citizenship?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  iin?: string;
  idNumber?: string;
  gender?: string;
  nationality?: string;
  birthPlace?: string;
  rawText?: string; // Store the raw text for debugging
}

export const extractTextFromImage = async (
  fileOrPath: File | string,
  _fileType?: string // Add underscore to indicate intentionally unused parameter
): Promise<string> => {
  try {
    console.log('Starting OCR extraction...');
    
    if (typeof fileOrPath === 'string') {
      console.log('File path provided for OCR:', fileOrPath);
    } else {
      console.log('File info:', {
        name: fileOrPath.name, 
        type: fileOrPath.type, 
        size: `${(fileOrPath.size / (1024 * 1024)).toFixed(2)} MB`
      });
    }
    
    // Try to use multiple languages for better recognition
    console.log('Creating OCR worker with multiple languages...');
    const worker = await createWorker('eng+rus+kaz');
    
    try {
      console.log('Starting recognition...');
      const { data: { text } } = await worker.recognize(fileOrPath);
      console.log('Recognition completed, text length:', text.length);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('OCR initial recognition error, trying fallback language:', error);
      await worker.terminate();
      
      // Fall back to English only if combined languages fail
      console.log('Creating OCR worker with English only...');
      const fallbackWorker = await createWorker('eng');
      try {
        console.log('Starting fallback recognition...');
        const { data: { text } } = await fallbackWorker.recognize(fileOrPath);
        console.log('Fallback recognition completed, text length:', text.length);
        await fallbackWorker.terminate();
        return text;
      } catch (fallbackError) {
        console.error('Fallback OCR failed:', fallbackError);
        await fallbackWorker.terminate();
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const parsePassportData = (text: string): ExtractedDocumentData => {
  console.log('Parsing passport data from text...');
  
  const data: ExtractedDocumentData = {
    rawText: text // Store raw text for debugging
  };
  
  // Clean and normalize text to improve matching
  const normalizedText = text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,:<>()\/\-]/g, ' ')
    .trim();
  
  console.log('Normalized text length:', normalizedText.length);
  
  // Extract passport number - pattern like: "N12345678" or similar formats
  const passportNumberPatterns = [
    /\b[A-Z]\d{8}\b/,                             // Standard format N12345678
    /Passport No\.?:?\s*([A-Z0-9]{7,9})/i,        // With label
    /№\s*([A-Z0-9]{7,9})/i,                       // With № symbol
    /Паспорт\s*№?\s*([A-Z0-9]{7,9})/i,            // Russian/Kazakh label
    /номер\s*(?:паспорта)?:?\s*([A-Z0-9]{7,9})/i  // Another Russian variant
  ];
  
  for (const pattern of passportNumberPatterns) {
    const match = normalizedText.match(pattern);
    if (match && (match[1] || match[0])) {
      data.passportNumber = match[1] || match[0];
      console.log('Found passport number:', data.passportNumber);
      break;
    }
  }
  
  // Extract IIN (Individual Identification Number) - 12 digits
  const iinMatch = normalizedText.match(/\b\d{12}\b/);
  if (iinMatch) {
    data.iin = iinMatch[0];
    console.log('Found IIN:', data.iin);
  }
  
  // Extract name patterns with various labels in different languages
  const namePatterns = [
    /(?:Given names|Name|Имя|Аты|Имена)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:first name|given name)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:имя|имена)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.name = match[1].trim();
      console.log('Found name:', data.name);
      break;
    }
  }
  
  // If we still don't have a name, try a more generic approach
  if (!data.name) {
    // Look for capitalized words near name-related terms
    const genericNameMatches = normalizedText.match(/(?:name|имя|first|given|имена)[:\s]+([A-ZА-Я][a-zа-я]+)/i);
    if (genericNameMatches && genericNameMatches[1]) {
      data.name = genericNameMatches[1].trim();
      console.log('Found name using generic approach:', data.name);
    }
  }
  
  // Extract surname patterns
  const surnamePatterns = [
    /(?:Surname|Фамилия|Тегі)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:last name|family name)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:фамилия)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i
  ];
  
  for (const pattern of surnamePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.surname = match[1].trim();
      console.log('Found surname:', data.surname);
      break;
    }
  }
  
  // If we still don't have a surname, try a more generic approach
  if (!data.surname && data.name) {
    // Look for capitalized words near surname-related terms
    const genericSurnameMatches = normalizedText.match(/(?:surname|family|фамилия|last)[:\s]+([A-ZА-Я][a-zа-я]+)/i);
    if (genericSurnameMatches && genericSurnameMatches[1]) {
      data.surname = genericSurnameMatches[1].trim();
      console.log('Found surname using generic approach:', data.surname);
    }
  }
  
  // Extract gender
  const genderMatch = normalizedText.match(/(?:Gender|Sex|Пол|Жынысы)[:\s]+([MFmfМЖмж]|Male|Female|Муж|Жен|мужской|женский)/i);
  if (genderMatch && genderMatch[1]) {
    const genderValue = genderMatch[1].trim().toLowerCase();
    if (['m', 'male', 'м', 'муж', 'мужской'].includes(genderValue)) {
      data.gender = 'M';
      console.log('Found gender: Male');
    } else if (['f', 'female', 'ж', 'жен', 'женский'].includes(genderValue)) {
      data.gender = 'F';
      console.log('Found gender: Female');
    }
  }
  
  // Extract nationality
  const nationalityMatch = normalizedText.match(/(?:Nationality|Национальность|Ұлты)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i);
  if (nationalityMatch && nationalityMatch[1]) {
    data.nationality = nationalityMatch[1].trim();
    console.log('Found nationality:', data.nationality);
  }
  
  // Extract dates (birth, issue, expiry)
  // Format: DD.MM.YYYY or YYYY-MM-DD or DD MMM YYYY
  const datePatterns = [
    /\b(\d{2}[./-]\d{2}[./-]\d{4})\b/g,  // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{4}[./-]\d{2}[./-]\d{2})\b/g,  // YYYY.MM.DD or YYYY/MM/DD or YYYY-MM-DD
    /\b(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\b/gi  // DD MMM YYYY
  ];
  
  let dates: string[] = [];
  for (const pattern of datePatterns) {
    const matches = [...normalizedText.matchAll(pattern)].map(match => match[0]);
    dates = [...dates, ...matches];
  }
  
  console.log('Found dates:', dates);
  
  // Assign dates based on context clues in surrounding text
  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i];
    // Look for context 50 characters before and after the date
    const dateContext = normalizedText.substring(
      Math.max(0, normalizedText.indexOf(currentDate) - 50), 
      Math.min(normalizedText.length, normalizedText.indexOf(currentDate) + currentDate.length + 50)
    );
    
    if (dateContext.match(/birth|рожд|date of birth|дата рождения|туған|туылған|born/i)) {
      data.dateOfBirth = currentDate;
      console.log('Found date of birth:', currentDate);
    } else if (dateContext.match(/issue|выда|date of issue|дата выдачи|берілген|берілді/i)) {
      data.passportIssueDate = currentDate;
      console.log('Found issue date:', currentDate);
    } else if (dateContext.match(/expir|действ|valid until|годен до|дейін жарамды|expiry|expire/i)) {
      data.passportExpiryDate = currentDate;
      console.log('Found expiry date:', currentDate);
    }
  }
  
  // If we have multiple dates but couldn't associate them by context, 
  // make an educated guess based on chronological order
  if (dates.length > 0) {
    // Try to convert dates to timestamps for comparison
    try {
      const sortedDates = [...dates].sort((a, b) => {
        // Convert to a common format (YYYY-MM-DD)
        const formatDate = (dateStr: string): string => {
          // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
          if (/^\d{2}[./-]\d{2}[./-]\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split(/[./-]/);
            return `${year}-${month}-${day}`;
          }
          // YYYY.MM.DD or YYYY/MM/DD or YYYY-MM-DD
          if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(dateStr)) {
            return dateStr.replace(/[./]/g, '-');
          }
          // DD MMM YYYY
          if (/^\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i.test(dateStr)) {
            const [day, month, year] = dateStr.split(/\s+/);
            const monthMap: {[key: string]: string} = {
              'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
              'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            const monthNum = monthMap[month.toLowerCase().substring(0, 3)];
            return `${year}-${monthNum}-${day}`;
          }
          return dateStr;
        };
        
        return new Date(formatDate(a)).getTime() - new Date(formatDate(b)).getTime();
      });
      
      // If we have multiple dates but couldn't assign them by context
      if (sortedDates.length >= 3) {
        if (!data.dateOfBirth) {
          data.dateOfBirth = sortedDates[0]; // Earliest date is likely birth date
          console.log('Assigned birth date by chronology:', sortedDates[0]);
        }
        if (!data.passportIssueDate) {
          data.passportIssueDate = sortedDates[1]; // Middle date is likely issue date
          console.log('Assigned issue date by chronology:', sortedDates[1]);
        }
        if (!data.passportExpiryDate) {
          data.passportExpiryDate = sortedDates[sortedDates.length - 1]; // Latest date is likely expiry
          console.log('Assigned expiry date by chronology:', sortedDates[sortedDates.length - 1]);
        }
      } else if (sortedDates.length === 2) {
        // If we have only two dates, make a reasonable guess
        if (!data.dateOfBirth) {
          data.dateOfBirth = sortedDates[0]; // Earlier date is likely birth date
          console.log('Assigned birth date by chronology (2 dates):', sortedDates[0]);
        }
        if (!data.passportIssueDate) {
          data.passportIssueDate = sortedDates[1]; // Later date is likely issue date
          console.log('Assigned issue date by chronology (2 dates):', sortedDates[1]);
        }
      }
    } catch (error) {
      console.error('Error sorting dates:', error);
    }
  }
  
  // Extract citizenship
  const citizenshipPatterns = [
    /(?:Citizenship|Nationality|Гражданство|Азаматтығы)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:Citizen of|Country)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i,
    /(?:гражданство)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё]+)/i
  ];
  
  for (const pattern of citizenshipPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.citizenship = match[1].trim();
      console.log('Found citizenship:', data.citizenship);
      break;
    }
  }
  
  // Extract birth place
  const birthPlacePatterns = [
    /(?:Place of birth|Birth place|Место рождения|Туған жері)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё\s]+?)(?:\b\d|\n|,)/i,
    /(?:Born in|Born at)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё\s]+?)(?:\b\d|\n|,)/i,
    /(?:место рождения)[:\s]+([A-Za-zА-Яа-яІіҢңҒғҮүӨөҚқЁё\s]+?)(?:\b\d|\n|,)/i
  ];
  
  for (const pattern of birthPlacePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.birthPlace = match[1].trim();
      console.log('Found birth place:', data.birthPlace);
      break;
    }
  }
  
  // Extract ID card number (usually 9 digits)
  const idNumberPatterns = [
    /(?:ID Number|№ удостоверения|ID card no|Жеке куәлік №)[:\s]*(\d{9})/i,
    /(?:ID|Identity card)[:\s]*(\d{9})/i,
    /(?:удостоверение личности|личное удостоверение)[:\s]*(?:№)?(\d{9})/i
  ];
  
  for (const pattern of idNumberPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.idNumber = match[1];
      console.log('Found ID number:', data.idNumber);
      break;
    }
  }
  
  return data;
};

export const extractDocumentData = async (fileOrPath: File | string, fileType?: string): Promise<ExtractedDocumentData> => {
  try {
    console.log('Starting document data extraction...');
    const text = await extractTextFromImage(fileOrPath, fileType);
    if (!text || text.trim().length === 0) {
      console.error('No text extracted from document');
      throw new Error('No text could be extracted from the document');
    }
    
    const parsedData = parsePassportData(text);
    
    // Check if we extracted meaningful data (at least name or passport number)
    if (!parsedData.name && !parsedData.passportNumber && !parsedData.iin) {
      console.warn('OCR extraction yielded insufficient data', { 
        extractedFields: Object.keys(parsedData).filter(k => k !== 'rawText'),
        textLength: text.length
      });
      
      // Return partial data instead of throwing error
      return { 
        ...parsedData,
        rawText: text 
      };
    }
    
    console.log('Document data extraction completed successfully');
    return parsedData;
  } catch (error) {
    console.error('Document data extraction error:', error);
    // Return an empty object with just the error message and raw text if possible
    return { 
      rawText: error instanceof Error ? error.message : 'Unknown error during OCR processing' 
    };
  }
}; 