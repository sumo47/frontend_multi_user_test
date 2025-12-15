import api from './axios';

/**
 * Create a new test
 */
export const createTest = async (testData) => {
    const response = await api.post('/test/create', testData);
    return response.data;
};

/**
 * Get user's created tests
 */
export const getMyTests = async () => {
    const response = await api.get('/test/my-tests');
    return response.data;
};

/**
 * Get all tests from all users
 */
export const getAllTests = async () => {
    const response = await api.get('/test/all');
    return response.data;
};
