import api from './apiClient';

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/feedback', feedbackData);
  return response.data;
};

export const getFeedbackSummary = async () => {
  const response = await api.get('/feedback/summary');
  return response.data;
};
