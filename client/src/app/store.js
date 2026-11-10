import { combineReducers, configureStore } from "@reduxjs/toolkit";
import auth, { logout } from "../features/authSlice";
import dashboard from "../features/dashboardSlice";
import attendance from "../features/attendanceSlice";
import payroll from "../features/payrollSlice";
import reports from "../features/reportsSlice";
import deployments from "../features/deploymentsSlice";
import access from "../features/accessSlice";
import {
  guards,
  clients,
  sites,
  contractors,
  users,
} from "../features/entities";

const appReducer = combineReducers({
  auth,
  dashboard,
  attendance,
  payroll,
  reports,
  deployments,
  guards: guards.reducer,
  clients: clients.reducer,
  sites: sites.reducer,
  contractors: contractors.reducer,
  users: users.reducer,
  access,
});

/** On sign out every slice goes back to empty, so the next person never sees the previous person's data. */
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    const fresh = appReducer(undefined, action);
    return { ...fresh, auth: appReducer(state, action).auth }; // auth clears its own token and user
  }
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });

// Axios fires this when the API answers 401 (token expired).
window.addEventListener("auth:logout", () => store.dispatch(logout()));
