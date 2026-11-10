import createCrudSlice from './createCrudSlice';

export const guards = createCrudSlice('guards', '/guards', 'Guard');
export const clients = createCrudSlice('clients', '/clients', 'Client');
export const sites = createCrudSlice('sites', '/sites', 'Site');
export const contractors = createCrudSlice('contractors', '/contractors', 'Contractor');
export const deploymentsBase = createCrudSlice('deployments', '/deployments', 'Deployment');
export const users = createCrudSlice('users', '/users', 'User');
