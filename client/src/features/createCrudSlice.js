import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../services/api';

/**
 * Generates a Redux slice + thunks for a REST resource.
 *  - items/total/page   : the paginated table
 *  - options            : full list used to fill dropdowns elsewhere
 *  - current            : single record (detail page)
 */
export default function createCrudSlice(name, endpoint, label) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params = {}) => (await api.get(endpoint, { params })).data);
  const fetchOptions = createAsyncThunk(`${name}/fetchOptions`, async () => (await api.get(endpoint, { params: { all: 1, isActive: 1 } })).data.data);
  const fetchOne = createAsyncThunk(`${name}/fetchOne`, async (id) => (await api.get(`${endpoint}/${id}`)).data);
  const create = createAsyncThunk(`${name}/create`, async (body) => {
    const { data } = await api.post(endpoint, body);
    toast.success(`${label} added`);
    return data;
  });
  const update = createAsyncThunk(`${name}/update`, async ({ id, body }) => {
    const { data } = await api.put(`${endpoint}/${id}`, body);
    toast.success(`${label} updated`);
    return data;
  });
  const remove = createAsyncThunk(`${name}/remove`, async (id) => {
    await api.delete(`${endpoint}/${id}`);
    toast.success(`${label} deactivated`);
    return id;
  });

  const initialState = { items: [], total: 0, page: 1, pageSize: 10, options: [], current: null, loading: false, saving: false };

  const slice = createSlice({
    name,
    initialState,
    reducers: { clearCurrent: (s) => { s.current = null; } },
    extraReducers: (b) => {
      b.addCase(fetchAll.pending, (s) => { s.loading = true; })
        .addCase(fetchAll.fulfilled, (s, { payload }) => {
          s.loading = false; s.items = payload.data; s.total = payload.total; s.page = payload.page; s.pageSize = payload.pageSize;
        })
        .addCase(fetchAll.rejected, (s) => { s.loading = false; })
        .addCase(fetchOptions.fulfilled, (s, { payload }) => { s.options = payload; })
        .addCase(fetchOne.pending, (s) => { s.loading = true; })
        .addCase(fetchOne.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload; })
        .addCase(fetchOne.rejected, (s) => { s.loading = false; });
      [create, update, remove].forEach((t) =>
        b.addCase(t.pending, (s) => { s.saving = true; })
          .addCase(t.fulfilled, (s) => { s.saving = false; })
          .addCase(t.rejected, (s) => { s.saving = false; })
      );
    },
  });

  return { slice, reducer: slice.reducer, actions: { fetchAll, fetchOptions, fetchOne, create, update, remove, ...slice.actions } };
}
