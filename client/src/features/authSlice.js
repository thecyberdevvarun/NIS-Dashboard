import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api, { TOKEN_KEY, USER_KEY } from '../services/api';

const readUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  toast.success(`Welcome, ${data.user.name}`);
  return data;
});

export const fetchMe = createAsyncThunk('auth/me', async () => (await api.get('/auth/me')).data);

const slice = createSlice({
  name: 'auth',
  initialState: { token: localStorage.getItem(TOKEN_KEY), user: readUser(), loading: false },
  reducers: {
    logout: (s) => {
      s.token = null; s.user = null;
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.loading = true; })
      .addCase(login.fulfilled, (s, { payload }) => { s.loading = false; s.token = payload.token; s.user = payload.user; })
      .addCase(login.rejected, (s) => { s.loading = false; })
      .addCase(fetchMe.fulfilled, (s, { payload }) => { s.user = payload; });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
