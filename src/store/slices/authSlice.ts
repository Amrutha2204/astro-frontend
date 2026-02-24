import { createSlice } from "@reduxjs/toolkit";

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
export const selectIsGuest = (s: { auth: AuthState }) => {
  const t = s.auth.token?.trim();
  return !(t && t.split(".").length === 3);
};
