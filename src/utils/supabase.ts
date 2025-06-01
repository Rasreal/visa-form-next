import { createClient } from '@supabase/supabase-js';
import { VisaFormData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with explicit configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
});

export const saveFormData = async (
  formData: VisaFormData,
  agentId: string,
  step: number,
  uploadedFiles: { [key: string]: string } = {},
  retryCount = 0
): Promise<{ data: unknown; error: Error | null }> => {
  const maxRetries = 3;

  try {
    // Extract phone number from form data for separate storage
    const phoneNumber = formData.phone || null;

    const { data, error } = await supabase
      .from('visa_applications')
      .upsert({
        agent_id: agentId,
        step_status: step,
        form_data: formData,
        uploaded_files: uploadedFiles,
        phone_number: phoneNumber,
        updated_at: new Date(),
      }, {
        onConflict: 'agent_id'
      })
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error saving form data (attempt ${retryCount + 1}):`, error);

    // Handle specific constraint violation error
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      console.log('Attempting to handle constraint violation by updating existing record...');

      // Try a direct update instead of upsert
      try {
        // Extract phone number from form data for separate storage
        const phoneNumber = formData.phone || null;

        const { data: updateData, error: updateError } = await supabase
          .from('visa_applications')
          .update({
            step_status: step,
            form_data: formData,
            uploaded_files: uploadedFiles,
            phone_number: phoneNumber,
            updated_at: new Date(),
          })
          .eq('agent_id', agentId)
          .select();

        if (updateError) throw updateError;

        console.log('Form data updated successfully via direct update', phoneNumber ? `with phone: ${phoneNumber}` : 'without phone');
        return { data: updateData, error: null };
      } catch (updateErr) {
        console.error('Direct update also failed:', updateErr);
        return { data: null, error: updateErr instanceof Error ? updateErr : new Error(String(updateErr)) };
      }
    }

    // Retry on network errors or temporary failures
    if (retryCount < maxRetries &&
        (error instanceof Error &&
         (error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('503') ||
          error.message.includes('502')))) {

      console.log(`Retrying save operation in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return saveFormData(formData, agentId, step, uploadedFiles, retryCount + 1);
    }

    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Create a new user record in Supabase
 */
export const createNewUser = async (agentId: string) => {
  try {
    console.log(`Creating new user record for agent ${agentId}`);

    const { data, error } = await supabase
      .from('visa_applications')
      .insert({
        agent_id: agentId,
        step_status: 1,
        form_data: {},
        uploaded_files: {},
        phone_number: null,
        whatsapp_redirected: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new user:', error);
      throw error;
    }

    console.log('New user record created successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Failed to create new user:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Get existing user data or create new user if not found
 */
export const getOrCreateUserData = async (agentId: string) => {
  try {
    console.log(`Getting or creating user data for agent ${agentId}`);

    // First try to get existing data
    const { data: existingData, error: getError } = await getFormData(agentId);

    if (getError) {
      console.error('Error getting existing data:', getError);
      return { data: null, error: getError, isNewUser: false };
    }

    // If data exists, return it
    if (existingData) {
      console.log('Found existing user data');
      return { data: existingData, error: null, isNewUser: false };
    }

    // If no data found, create new user
    console.log('No existing data found, creating new user');
    const { data: newData, error: createError } = await createNewUser(agentId);

    if (createError) {
      console.error('Error creating new user:', createError);
      return { data: null, error: createError, isNewUser: true };
    }

    console.log('New user created successfully');
    return { data: newData, error: null, isNewUser: true };
  } catch (error) {
    console.error('Error in getOrCreateUserData:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)), isNewUser: false };
  }
};

export const getFormData = async (agentId: string, retryCount = 0): Promise<{ data: unknown; error: Error | null }> => {
  const maxRetries = 3;

  try {
    console.log(`Getting form data for agent ${agentId}, attempt ${retryCount + 1}`);

    // Validate inputs
    if (!agentId || agentId.trim() === '') {
      throw new Error('Agent ID is required');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('agent_id', agentId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data found

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Form data retrieved successfully:', data ? 'found' : 'not found');
    return { data, error: null };
  } catch (error) {
    console.error(`Error getting form data (attempt ${retryCount + 1}):`, error);

    // Retry on network errors or 406 errors
    if (retryCount < maxRetries &&
        (error instanceof Error &&
         (error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('406') ||
          error.message.includes('503') ||
          error.message.includes('502')))) {

      console.log(`Retrying get operation in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return getFormData(agentId, retryCount + 1);
    }

    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const searchApplicationsByPassport = async (passportNumber: string) => {
  try {
    if (!passportNumber) {
      return { data: null, error: new Error('Passport number is required') };
    }

    console.log('Searching for application with passport:', passportNumber);

    // We need to search inside the JSONB form_data for passportNumber
    // Using proper PostgREST syntax for JSONB queries
    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('form_data->>passportNumber', passportNumber)
      .order('created_at', { ascending: false })
      .limit(1); // Get the most recent application

    if (error) {
      console.error('Supabase error searching applications:', error);
      throw error;
    }

    console.log('Search results:', data);

    // Check if we got a valid result
    if (data && data.length > 0) {
      return { data: data[0], error: null };
    } else {
      return { data: null, error: null }; // Not found but no error
    }
  } catch (error) {
    console.error('Error searching for applications:', error);
    return { data: null, error };
  }
};

export const searchApplicationsByPhone = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      return { data: null, error: new Error('Phone number is required') };
    }

    console.log('Searching for application with phone:', phoneNumber);

    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1); // Get the most recent application

    if (error) {
      console.error('Supabase error searching applications by phone:', error);
      throw error;
    }

    console.log('Search results by phone:', data);

    // Check if we got a valid result
    if (data && data.length > 0) {
      return { data: data[0], error: null };
    } else {
      return { data: null, error: null }; // Not found but no error
    }
  } catch (error) {
    console.error('Error searching for applications by phone:', error);
    return { data: null, error };
  }
};

export const markWhatsappRedirected = async (agentId: string) => {
  try {
    const { error } = await supabase
      .from('visa_applications')
      .update({ whatsapp_redirected: true })
      .eq('agent_id', agentId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking WhatsApp redirected:', error);
    return { error };
  }
};

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

    // Validate configuration first
    if (!supabaseUrl || !supabaseAnonKey) {
      const configError = new Error('Supabase configuration is missing');
      console.error('Configuration error:', configError);
      return { success: false, error: configError };
    }

    // Try a simple query to test the connection
    // If the table doesn't exist, we'll get a different error than connection issues
    const { data, error } = await supabase
      .from('visa_applications')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's a table not found error (which means connection works)
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        console.log('Supabase connection successful, but table needs to be created');
        return { success: true, data: null, needsTableCreation: true };
      }

      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }

    console.log('Supabase connection test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { success: false, error };
  }
};
