import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';

export const fetchSheet = createAsyncThunk('attendance/sheet', async (params) => (await api.get('/attendance/sheet', { params })).data);
export const fetchSummary = createAsyncThunk('attendance/summary', async (params) => (await api.get('/attendance/summary', { params })).data);
export const saveAttendance = createAsyncThunk('attendance/save', async (body) => {
  const { data } = await api.post('/attendance/bulk', body);
  toast.success(data.message);
  return data;
});

const slice = createSlice({
  name: 'attendance',
  initialState: { sheet: [], summary: [], loading: false, saving: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchSheet.pending, (s) => { s.loading = true; })
      .addCase(fetchSheet.fulfilled, (s, { payload }) => { s.loading = false; s.sheet = payload; })
      .addCase(fetchSheet.rejected, (s) => { s.loading = false; })
      .addCase(fetchSummary.pending, (s) => { s.loading = true; })
      .addCase(fetchSummary.fulfilled, (s, { payload }) => { s.loading = false; s.summary = payload; })
      .addCase(fetchSummary.rejected, (s) => { s.loading = false; })
      .addCase(saveAttendance.pending, (s) => { s.saving = true; })
      .addCase(saveAttendance.fulfilled, (s) => { s.saving = false; })
      .addCase(saveAttendance.rejected, (s) => { s.saving = false; });
  },
});
export default slice.reducer;
