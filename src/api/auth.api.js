import api from './axios';

/**
 * Register a new user
 */
export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
        name,
        email,
        password
    });
    return response.data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
    const response = await api.post('/auth/login', {
        email,
        password
    });
    return response.data;
};
