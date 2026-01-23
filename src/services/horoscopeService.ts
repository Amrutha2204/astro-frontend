import axios from "axios";

const API_BASE = "http://localhost:8001/api/v1/horoscope";

/* DAILY HOROSCOPE */
export const getDailyHoroscope = (zodiac: string) => {
  return axios.get(`${API_BASE}/daily`, {
    params: { zodiac }
  });
};

/* WEEKLY HOROSCOPE */
export const getWeeklyHoroscope = (zodiac: string) => {
  return axios.get(`${API_BASE}/weekly`, {
    params: { zodiac }
  });
};

/* MONTHLY HOROSCOPE */
export const getMonthlyHoroscope = (zodiac: string) => {
  return axios.get(`${API_BASE}/monthly`, {
    params: { zodiac }
  });
};
