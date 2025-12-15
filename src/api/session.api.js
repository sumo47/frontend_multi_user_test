import api from './axios';

/**
 * Create a new test session
 */
export const createSession = async (testId) => {
    const response = await api.post('/session/create', { testId });
    return response.data;
};

/**
 * Join an existing session
 */
export const joinSession = async (sessionCode) => {
    const response = await api.post('/session/join', { sessionCode });
    return response.data;
};

/**
 * Mark user as ready (triggers auto-start)
 */
export const markReady = async (sessionId) => {
    const response = await api.post('/session/ready', { sessionId });
    return response.data;
};

/**
 * Get session status (for polling)
 */
export const getSessionStatus = async (sessionId) => {
    const response = await api.get(`/session/status/${sessionId}`);
    return response.data;
};

/**
 * Get all sessions (for session history)
 */
export const getAllSessions = async () => {
    const response = await api.get('/session/all');
    return response.data;
};
