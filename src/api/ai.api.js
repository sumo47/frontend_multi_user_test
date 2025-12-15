import api from './axios';

/**
 * Extract questions from image using AI
 */
export const extractQuestionsFromImage = async (imageBase64) => {
    const response = await api.post('/ai/extract-questions', {
        image: imageBase64
    });
    return response.data;
};
