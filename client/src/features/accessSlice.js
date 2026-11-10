import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';

export const fetchAccess = createAsyncThunk('access/fetch', async () => (await api.get('/access')).data);
export const saveAccess = createAsyncThunk('access/save', async (matrix) => {
  const { data } = await api.put('/access', { matrix });
  toast.success(data.message);
  return matrix;
});

const slice = createSlice({
  name: 'access',
  initialState: { pages: [], roles: [], matrix: {}, loading: false, saving: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAccess.pending, (s) => { s.loading = true; })
      .addCase(fetchAccess.fulfilled, (s, { payload }) => { s.loading = false; s.pages = payload.pages; s.roles = payload.roles; s.matrix = payload.matrix; })
      .addCase(fetchAccess.rejected, (s) => { s.loading = false; })
      .addCase(saveAccess.pending, (s) => { s.saving = true; })
      .addCase(saveAccess.fulfilled, (s, { payload }) => { s.saving = false; s.matrix = payload; })
      .addCase(saveAccess.rejected, (s) => { s.saving = false; });
  },
});
export default slice.reducer;
