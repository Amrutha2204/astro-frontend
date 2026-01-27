// import axios, { AxiosError } from "axios";

// const API = "http://localhost:8001/api/v1/auth";

// /* REGISTER */
// export const registerUser = (data: {
//   name: string;
//   email: string;
//   password: string;
//   phoneNumber: string;
//   timezone: string;
//   roleId: number;
//   guestId: string | null;
//   dob: string;
//   birthPlace: string;
//   birthTime: string;
// }) => {
//   return axios.post(`${API}/signup`, data);
// };

// /* LOGIN */
// export const loginUser = async (data: {
//   email: string;
//   password: string;
// }) => {
//   try {
//     const response = await axios.post(`${API}/login`, data, {
//       // Prevent axios from throwing errors that Next.js catches
//       validateStatus: function (status) {
//         // Return true for all status codes so axios doesn't throw
//         // We'll handle errors in the component
//         return status >= 200 && status < 600;
//       }
//     });
    
//     // If status is not 2xx, throw error to be caught by component
//     if (response.status < 200 || response.status >= 300) {
//       const error: any = new Error(response.data?.message || 'Login failed');
//       error.response = response;
//       error.isAxiosError = true;
//       throw error;
//     }
//     return response;
//   } catch (error: any) {
//     // Re-throw to be caught by component's catch handler
//     throw error;
//   }
// };

import axios from "axios";

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
  return axios.post(`${API}/login`, data, {
    // Accept 2xx and 401 as valid (no throw)
    validateStatus: (status) => {
      return status === 200 || status === 401;
    },
  });
};
