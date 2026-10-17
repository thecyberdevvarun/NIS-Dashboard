import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';

export const fetchPayroll = createAsyncThunk('payroll/fetch', async (params) => (await api.get('/payroll', { params })).data);
export const generatePayroll = createAsyncThunk('payroll/generate', async (body) => {
  const { data } = await api.post('/payroll/generate', body);
  toast.success(data.message);
  return data;
});
export const updateDeductions = createAsyncThunk('payroll/update', async ({ id, body }) => {
  const { data } = await api.put(`/payroll/${id}`, body);
  toast.success('Deductions saved');
  return data;
});
export const markPaid = createAsyncThunk('payroll/pay', async ({ id, body }) => {
  const { data } = await api.patch(`/payroll/${id}/pay`, body);
  toast.success('Marked as paid');
  return data;
});

const slice = createSlice({
  name: 'payroll',
  initialState: { items: [], totals: { count: 0, net: 0, paid: 0, pending: 0 }, loading: false, saving: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPayroll.pending, (s) => { s.loading = true; })
      .addCase(fetchPayroll.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload.data; s.totals = payload.totals; })
      .addCase(fetchPayroll.rejected, (s) => { s.loading = false; });
    [generatePayroll, updateDeductions, markPaid].forEach((t) =>
      b.addCase(t.pending, (s) => { s.saving = true; })
        .addCase(t.fulfilled, (s) => { s.saving = false; })
        .addCase(t.rejected, (s) => { s.saving = false; })
    );
  },
});
export default slice.reducer;
