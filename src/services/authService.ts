import axios from "axios";

const API = "http://localhost:8001/api/v1/auth";

export const loginUser = (data: {
  email: string;
  password: string;
}) => {
  return axios.post(`${API}/login`, data);
};
