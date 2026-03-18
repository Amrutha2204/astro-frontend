import { createSlice } from "@reduxjs/toolkit";
import { isValidJwtFormat } from "@/utils/auth";

type AuthState = {
  token: string | null;
  _rehydrated: boolean;
};

const initialState: AuthState = {
  token: null,
  _rehydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: { payload: string }) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    rehydrate: (state, action: { payload: { token: string | null } }) => {
      state.token = action.payload.token;
      state._rehydrated = true;
    },
  },
});

export const { setToken, clearToken, rehydrate } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (s: { auth: AuthState }) => s.auth.token;
export const selectIsRehydrated = (s: { auth: AuthState }) => s.auth._rehydrated;
export const selectIsGuest = (s: { auth: AuthState }) => !isValidJwtFormat(s.auth.token);

/** Decode JWT payload and return roleId (auth-service: Admin = 3). Used for UI only; backend validates. */
export const selectRoleId = (s: { auth: AuthState }): number | undefined => {
  const token = s.auth.token?.trim();
  if (!token || !isValidJwtFormat(token)) return undefined;
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.roleId === "number" ? decoded.roleId : undefined;
  } catch {
    return undefined;
  }
};

export const ADMIN_ROLE_ID = 3;
