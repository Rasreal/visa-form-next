import { NextApiRequest, NextApiResponse } from 'next';

interface WhatsAppRequest {
  phone: string;
}

interface WappiApiResponse {
  status: string;
  timestamp: number;
  time: string;
  message_id: string;
  task_id: string;
  uuid?: string;
  message?: string;
}

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: WappiApiResponse;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppResponse>
) {
  console.log('WhatsApp API called with method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone }: WhatsAppRequest = req.body;

    if (!phone) {
      console.log('No phone number provided');
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    console.log('Original phone number:', phone);

    // Clean phone number - remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Remove + if present and ensure it starts with 7 for Kazakhstan numbers
    let formattedPhone = cleanPhone.replace(/^\+/, '');
    
    // If phone starts with 8, replace with 7
    if (formattedPhone.startsWith('8')) {
      formattedPhone = '7' + formattedPhone.substring(1);
    }
    
    // If phone doesn't start with 7, add 7 prefix for Kazakhstan
    if (!formattedPhone.startsWith('7')) {
      formattedPhone = '7' + formattedPhone;
    }

    console.log('Formatted phone number:', formattedPhone);

    const message = 'Привет! Спасибо за заявку! Готов продолжить? Мы можем проанализировать твою анкеты и выдать процент возможности в получении визы!';

    const apiUrl = 'https://wappi.pro/api/sync/message/send?profile_id=3f5631a4-b23f';
    
    console.log('Sending request to Wappi API...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'ff033765135d4167dc8c341d7b10629f31e1a69d',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: message,
        recipient: formattedPhone
      })
    });

    console.log('Wappi API response status:', response.status);
    
    const responseData = await response.json();
    console.log('Wappi API response data:', responseData);

    if (!response.ok) {
      console.error('WhatsApp API error:', responseData);
      return res.status(response.status).json({ 
        success: false, 
        error: `WhatsApp API error: ${responseData.message || 'Unknown error'}`,
        data: responseData
      });
    }

    console.log('WhatsApp message sent successfully:', responseData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'WhatsApp message sent successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send WhatsApp message' 
    });
  }
} 