import axios from "axios";

const BASE_URL = "http://localhost:8002";

export const getMyDay = (token:string) =>
  axios.get(`${BASE_URL}/horoscope/my-day-today`, {
    headers:{ Authorization:`Bearer ${token}` }
  });
