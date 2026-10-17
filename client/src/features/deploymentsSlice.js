import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';
import { deploymentsBase } from './entities';

export const assignGuard = createAsyncThunk('deployments/assign', async (body) => {
  const { data } = await api.post('/deployments', body);
  toast.success('Guard assigned to site');
  return data;
});

export const endDeployment = createAsyncThunk('deployments/end', async ({ id, endDate }) => {
  await api.put(`/deployments/${id}/end`, { endDate });
  toast.success('Deployment ended');
  return id;
});

export const { fetchAll: fetchDeployments } = deploymentsBase.actions;
export default deploymentsBase.reducer;
