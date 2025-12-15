import api from './axios';

/**
 * Save or update an answer
 */
export const saveAnswer = async (sessionId, questionId, selectedOption) => {
    const response = await api.post('/answer/save', {
        sessionId,
        questionId,
        selectedOption
    });
    return response.data;
};

/**
 * Submit attempt
 */
export const submitAttempt = async (sessionId) => {
    const response = await api.post('/answer/submit', { sessionId });
    return response.data;
};
