import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async () => (await api.get('/dashboard')).data);

const slice = createSlice({
  name: 'dashboard',
  initialState: { data: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => { s.loading = true; })
      .addCase(fetchDashboard.fulfilled, (s, { payload }) => { s.loading = false; s.data = payload; })
      .addCase(fetchDashboard.rejected, (s) => { s.loading = false; });
  },
});
export default slice.reducer;
