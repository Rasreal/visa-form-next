/**
 * Utility functions for localStorage operations with error handling
 * Provides fallback behavior for environments where localStorage is not available
 */

// Keys used in localStorage
export const STORAGE_KEYS = {
  AGENT_ID: 'agentId',
  CURRENT_STEP: 'currentStep',
  FORM_BACKUP: 'formBackup', // Backup form data in case Supabase fails
} as const;

/**
 * Safely get an item from localStorage
 */
export const getFromLocalStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn(`Failed to read from localStorage (key: ${key}):`, error);
  }
  return null;
};

/**
 * Safely set an item in localStorage
 */
export const setToLocalStorage = (key: string, value: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    console.warn(`Failed to write to localStorage (key: ${key}):`, error);
  }
  return false;
};

/**
 * Safely remove an item from localStorage
 */
export const removeFromLocalStorage = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.warn(`Failed to remove from localStorage (key: ${key}):`, error);
  }
  return false;
};

/**
 * Generate a unique agent ID
 */
export const generateAgentId = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 11);
  return `agent_${timestamp}_${randomString}`;
};

/**
 * Get or create agent ID with backward compatibility
 */
export const getOrCreateAgentId = (urlAgentId?: string): string => {
  // Priority 1: URL parameter
  if (urlAgentId && urlAgentId.trim() !== '') {
    setToLocalStorage(STORAGE_KEYS.AGENT_ID, urlAgentId);
    return urlAgentId;
  }

  // Priority 2: localStorage
  const storedAgentId = getFromLocalStorage(STORAGE_KEYS.AGENT_ID);
  if (storedAgentId && storedAgentId.trim() !== '') {
    return storedAgentId;
  }

  // Priority 3: Cookies (backward compatibility)
  try {
    if (typeof document !== 'undefined') {
      const cookieAgentId = document.cookie
        .split('; ')
        .find(row => row.startsWith('agentId='))
        ?.split('=')[1];
      
      if (cookieAgentId && cookieAgentId.trim() !== '') {
        // Migrate to localStorage
        setToLocalStorage(STORAGE_KEYS.AGENT_ID, cookieAgentId);
        return cookieAgentId;
      }
    }
  } catch (error) {
    console.warn('Failed to read from cookies:', error);
  }

  // Priority 4: Generate new one
  const newAgentId = generateAgentId();
  setToLocalStorage(STORAGE_KEYS.AGENT_ID, newAgentId);
  return newAgentId;
};

/**
 * Get current step from localStorage
 */
export const getCurrentStep = (): number => {
  const storedStep = getFromLocalStorage(STORAGE_KEYS.CURRENT_STEP);
  if (storedStep) {
    const step = parseInt(storedStep, 10);
    return isNaN(step) ? 1 : Math.max(1, step);
  }
  return 1;
};

/**
 * Set current step in localStorage
 */
export const setCurrentStep = (step: number): boolean => {
  return setToLocalStorage(STORAGE_KEYS.CURRENT_STEP, step.toString());
};

/**
 * Clear all form-related data from localStorage
 */
export const clearFormData = (): void => {
  removeFromLocalStorage(STORAGE_KEYS.AGENT_ID);
  removeFromLocalStorage(STORAGE_KEYS.CURRENT_STEP);
  removeFromLocalStorage(STORAGE_KEYS.FORM_BACKUP);
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    }
  } catch (error) {
    console.warn('localStorage is not available:', error);
  }
  return false;
};
