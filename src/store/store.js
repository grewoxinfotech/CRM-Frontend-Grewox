import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/services/authSlice";
import { authApi } from "../auth/services/authApi";
import { companyApi } from "../superadmin/module/company/services/companyApi.js";
import { superadminProfileApi } from "../superadmin/module/profile/services/superadminProfileApi.js";
import superadminProfileReducer from "../superadmin/module/profile/services/superadminProfileSlice.js";
import { settingsApi } from "../superadmin/module/settings/services/settingsApi.js";
import { planApi } from "../superadmin/module/plans/services/planApi.js";
import { policyApi } from "../superadmin/module/policy/service/policyApi.js";
import { notesApi } from "../superadmin/module/notes/services/notesApi.js";
import { inquiryApi } from "../superadmin/module/inquary/services/inquaryApi.js";
import { subclientApi } from "../dashboard/module/user-management/subclient/services/subClientApi.js";
import { roleApi } from "../dashboard/module/hrm/role/services/roleApi.js";
import { userApi } from "../dashboard/module/user-management/users/services/userApi.js";
import { employeeApi } from "../dashboard/module/hrm/Employee/services/employeeApi.js";
import { designationApi } from "../dashboard/module/hrm/Designation/services/designationApi.js";
import { branchApi } from "../dashboard/module/hrm/Branch/services/branchApi.js";
import { departmentApi } from "../dashboard/module/hrm/Department/services/departmentApi.js";
import { trainingApi } from "../dashboard/module/hrm/Training/services/trainingApi.js";
import { esignatureApi } from "../superadmin/module/settings/eSignature/services/esignatureApi.js";
import { pipelineApi } from "../dashboard/module/crm/crmsystem/pipeline/services/pipelineApi.js";
import { leadStageApi } from "../dashboard/module/crm/crmsystem/leadstage/services/leadStageApi.js";
import { dealStageApi } from "../dashboard/module/crm/crmsystem/dealstage/services/dealStageApi.js";
import { sourceApi } from "../dashboard/module/crm/crmsystem/souce/services/SourceApi.js";
import { lableApi } from "../dashboard/module/crm/crmsystem/lable/services/LableApi.js";
import { contractTypeApi } from "../dashboard/module/crm/crmsystem/contractType/services/ContractTypeApi.js";
import { taskApi } from "../dashboard/module/crm/task/services/taskApi.js";
import { projectApi } from '../dashboard/module/crm/project/services/projectApi.js';
import { jobApi } from "../dashboard/module/job/jobs/services/jobApi.js";
import { jobApplicationApi } from "../dashboard/module/job/job applications/services/jobApplicationApi.js";
import { jobOnboardingApi } from "../dashboard/module/job/job onboarding/services/jobOnboardingApi.js";
import { offerLetterApi } from '../dashboard/module/job/offer letters/services/offerLetterApi.js';
import { interviewApi } from '../dashboard/module/job/interviews/services/interviewApi.js';
import { documentApi } from "../dashboard/module/hrm/Document/services/documentApi";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  superadminProfile: superadminProfileReducer,
  [authApi.reducerPath]: authApi.reducer,
  [documentApi.reducerPath]: documentApi.reducer,
  [companyApi.reducerPath]: companyApi.reducer,
  [superadminProfileApi.reducerPath]: superadminProfileApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [planApi.reducerPath]: planApi.reducer,
  [policyApi.reducerPath]: policyApi.reducer,
  [notesApi.reducerPath]: notesApi.reducer,
  [inquiryApi.reducerPath]: inquiryApi.reducer,
  [subclientApi.reducerPath]: subclientApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [employeeApi.reducerPath]: employeeApi.reducer,
  [designationApi.reducerPath]: designationApi.reducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
  [esignatureApi.reducerPath]: esignatureApi.reducer,
  [trainingApi.reducerPath]: trainingApi.reducer,
  [pipelineApi.reducerPath]: pipelineApi.reducer,
  [leadStageApi.reducerPath]: leadStageApi.reducer,
  [dealStageApi.reducerPath]: dealStageApi.reducer,
  [sourceApi.reducerPath]: sourceApi.reducer,
  [lableApi.reducerPath]: lableApi.reducer,
  [contractTypeApi.reducerPath]: contractTypeApi.reducer,
  [taskApi.reducerPath]: taskApi.reducer,
  [projectApi.reducerPath]: projectApi.reducer,
  [jobApi.reducerPath]: jobApi.reducer,
  [jobApplicationApi.reducerPath]: jobApplicationApi.reducer,
  [jobOnboardingApi.reducerPath]: jobOnboardingApi.reducer,
  [offerLetterApi.reducerPath]: offerLetterApi.reducer,
  [interviewApi.reducerPath]: interviewApi.reducer,
  [leadApi.reducerPath]: leadApi.reducer,
  [dealApi.reducerPath]: dealApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(authApi.middleware)
      .concat(documentApi.middleware)
      .concat(companyApi.middleware)
      .concat(superadminProfileApi.middleware)
      .concat(settingsApi.middleware)
      .concat(planApi.middleware)
      .concat(policyApi.middleware)
      .concat(notesApi.middleware)
      .concat(inquiryApi.middleware)
      .concat(esignatureApi.middleware)
      .concat(subclientApi.middleware)
      .concat(roleApi.middleware)
      .concat(userApi.middleware)
      .concat(employeeApi.middleware)
      .concat(designationApi.middleware)
      .concat(branchApi.middleware)
      .concat(departmentApi.middleware)
      .concat(trainingApi.middleware)
      .concat(pipelineApi.middleware)
      .concat(leadStageApi.middleware)
      .concat(dealStageApi.middleware)
      .concat(sourceApi.middleware)
      .concat(lableApi.middleware)
      .concat(contractTypeApi.middleware)
      .concat(taskApi.middleware)
      .concat(projectApi.middleware)
      .concat(jobApi.middleware)
      .concat(jobApplicationApi.middleware)
      .concat(jobOnboardingApi.middleware)
      .concat(offerLetterApi.middleware)
      .concat(interviewApi.middleware)
      .concat(leadApi.middleware)
      .concat(dealApi.middleware),
});

export const persistor = persistStore(store);

export default store;
