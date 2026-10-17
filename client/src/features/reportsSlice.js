import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchGuardDeployment = createAsyncThunk('reports/guardDeployment', async () => (await api.get('/reports/guard-deployment')).data);

const slice = createSlice({
  name: 'reports',
  initialState: { guardDeployment: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchGuardDeployment.pending, (s) => { s.loading = true; })
      .addCase(fetchGuardDeployment.fulfilled, (s, { payload }) => { s.loading = false; s.guardDeployment = payload; })
      .addCase(fetchGuardDeployment.rejected, (s) => { s.loading = false; });
  },
});
export default slice.reducer;
