import api from './axios';

/**
 * Get individual attempt result
 */
export const getAttemptResult = async (attemptId) => {
    const response = await api.get(`/result/${attemptId}`);
    return response.data;
};

/**
 * Get session summary
 */
export const getSessionSummary = async (sessionId) => {
    const response = await api.get(`/result/session/${sessionId}`);
    return response.data;
};
