import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/services/authSlice";
import { authApi } from "../auth/services/authApi";
import {
  companyApi,
  companyReducer,
} from "../superadmin/module/company/services";
import { superadminProfileApi } from "../superadmin/module/profile/services/superadminProfileApi";
import superadminProfileReducer from "../superadmin/module/profile/services/superadminProfileSlice";
import { settingsApi } from "../superadmin/module/settings/services/settingsApi";
import settingsReducer from "../superadmin/module/settings/services/settingsSlice";
import { planApi } from "../superadmin/module/plans/services/planApi";
import planReducer from "../superadmin/module/plans/services/planSlice";
import { policyApi } from "../superadmin/module/policy/service/policyApi";
import policyReducer from "../superadmin/module/policy/service/policySlice";
import { notesApi } from "../superadmin/module/notes/services/NotesApi";
import { inquiryApi,inquiryReducer } from '../superadmin/module/inquary/services/index';
import { esignatureApi, esignatureReducer } from '../superadmin/module/settings/eSignature/services/index';
import { subclientApi, subclientReducer } from "../dashboard/modual/user-management/subclient/services";
  // Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [companyApi.reducerPath]: companyApi.reducer,
  [superadminProfileApi.reducerPath]: superadminProfileApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [planApi.reducerPath]: planApi.reducer,
  [policyApi.reducerPath]: policyApi.reducer,
  [notesApi.reducerPath]: notesApi.reducer,
  [inquiryApi.reducerPath]: inquiryApi.reducer,
  [esignatureApi.reducerPath]: esignatureApi.reducer,
  [subclientApi.reducerPath]: subclientApi.reducer,
  company: companyReducer,
  superadminProfile: superadminProfileReducer,
  settings: settingsReducer,
  plan: planReducer,
  policy: policyReducer,
  inquiry: inquiryReducer,
  esignature: esignatureReducer,
  subclient: subclientReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(authApi.middleware)
      .concat(companyApi.middleware)
      .concat(superadminProfileApi.middleware)
      .concat(settingsApi.middleware)
      .concat(planApi.middleware)
      .concat(policyApi.middleware)
      .concat(notesApi.middleware)
      .concat(inquiryApi.middleware)
      .concat(esignatureApi.middleware)
      .concat(subclientApi.middleware),
});

export const persistor = persistStore(store);
export default store;
