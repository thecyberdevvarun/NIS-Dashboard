import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';

export const resetUserPassword = createAsyncThunk('users/resetPassword', async ({ id, newPassword }) => {
  const { data } = await api.post(`/users/${id}/reset-password`, { newPassword });
  toast.success('Password reset. Tell the user the new password');
  return data;
});
