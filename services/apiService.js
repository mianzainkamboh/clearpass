import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://gentle-temple-41605-c6a4704e4cb1.herokuapp.com/nexalert/api/v1/auth';

// Generate random UUID for X-Correlation-ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Store JWT token
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('jwt_token', token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

// Get JWT token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Clear JWT token
export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Error clearing token:', error);
    throw error;
  }
};

// Login API call
export const loginUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'X-Correlation-ID': generateUUID(),
      },
      body: JSON.stringify({
        username: 'jitendra',
        password: 'password1'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      await storeToken(data.token);
      return { success: true, token: data.token };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

// Validate tempLoginToken against expected value
export const validateTempLoginToken = (tempLoginToken) => {
  const VALID_TOKEN = 'abcdef';
  return tempLoginToken === VALID_TOKEN;
};

// Mobile login API call (for QR approval)
export const mobileLogin = async (tempLoginToken) => {
  try {
    // Validate tempLoginToken first
    if (!validateTempLoginToken(tempLoginToken)) {
      return { 
        success: false, 
        error: 'Invalid QR code. This code is not authorized for login approval.' 
      };
    }

    const token = await getToken();
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch(`${BASE_URL}/mobile-login`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': generateUUID(),
      },
      body: JSON.stringify({
        tempLoginToken: tempLoginToken
      })
    });

    if (response.ok) {
      const responseText = await response.text();
      return { success: true, data: responseText };
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Mobile login failed' }));
      return { success: false, error: errorData.message || 'Mobile login failed' };
    }
  } catch (error) {
    console.error('Mobile login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

// Logout API call
export const logoutUser = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': generateUUID(),
      },
      body: '{}'
    });

    if (response.ok) {
      const result = await response.json();
      if (result === true) {
        await clearToken();
        return { success: true };
      } else {
        return { success: false, error: 'Logout failed' };
      }
    } else {
      return { success: false, error: 'Logout failed' };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};