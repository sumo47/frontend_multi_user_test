import api from './axios';

/**
 * Get user's active session
 */
export const getActiveSession = async () => {
    const response = await api.get('/active-session');
    return response.data;
};
