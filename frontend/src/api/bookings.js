import apiClient from "./apiClient";

export const bookTicket = async (eventId, quantity = 1) => {
  const { data } = await apiClient.post("/bookings/book", { eventId, quantity });
  return data;
};

export const getMyTickets = async () => {
  const { data } = await apiClient.get("/bookings/my-tickets");
  return data;
};

export const cancelTicket = async (ticketId) => {
  const { data } = await apiClient.patch(`/bookings/${ticketId}/cancel`);
  return data;
};

export const processRefund = async (bookingId) => {
  const { data } = await apiClient.post("/bookings/process-refund", { bookingId });
  return data;
};
