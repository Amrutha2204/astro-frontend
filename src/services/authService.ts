import axios, { AxiosError } from "axios";

const API = "http://localhost:8001/api/v1/auth";

/* REGISTER */
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  timezone: string;
  roleId: number;
  guestId: string | null;
  dob: string;
  birthPlace: string;
  birthTime: string;
}) => {
  return axios.post(`${API}/signup`, data);
};

/* LOGIN */
export const loginUser = (data: {
  email: string;
  password: string;
}) => {
  return axios.post(`${API}/login`, data);
};
