import { Middleware } from "@reduxjs/toolkit";
import { setToken, clearToken } from "../slices/authSlice";

/** Syncs auth token to localStorage on setToken/clearToken. */
export const authSyncMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (setToken.match(action)) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", action.payload);
    }
  } else if (clearToken.match(action)) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.clear();
    }
  }
  return result;
};
