import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/notifications`, {
    withCredentials: true,
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.patch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
