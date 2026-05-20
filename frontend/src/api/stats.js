import apiClient from "./apiClient";

export const getProviderStats = async (filter = 'month') => {
  const { data } = await apiClient.get(`/stats/provider?filter=${filter}`);
  return data;
};

export const getOrganiserStats = async (period = 'total', eventId = 'total') => {
  const { data } = await apiClient.get(`/stats/organiser?period=${period}&eventId=${eventId}`);
  return data;
};
