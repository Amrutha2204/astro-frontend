import axios from "axios";

const API = "http://localhost:8001";

export const getUserDetails = (token: string) => {
  return axios.get(`${API}/api/v1/user-details/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveBirthDetails = (
  token: string,
  data: {
    dob: string;
    birthTime: string;
    placeOfBirth: string;
  }
) => {
  return axios.post(
    `${API}/api/v1/user-details/birth-details`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
