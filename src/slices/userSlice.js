import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    darkMode: false,
    user: null,
  },
  reducers: {
    toggleDarkMode: (state) => {
        state.darkMode = !state.darkMode; // Toggles darkMode between true and false
      },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const {  toggleDarkMode, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
