import api from './axios';

/**
 * Get current user profile
 */
export const getProfile = async () => {
    const response = await api.get('/user/profile');
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
    const response = await api.put('/user/profile', updates);
    return response.data;
};

/**
 * Get total users count
 */
export const getUsersCount = async () => {
    const response = await api.get('/user/count');
    return response.data;
};
