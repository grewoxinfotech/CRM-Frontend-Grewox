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
import { notesApi } from "../superadmin/module/notes/services/notesApi";
import {
  inquiryApi,
  inquiryReducer,
} from "../superadmin/module/inquary/services/index";
import {
  subclientApi,
  subclientReducer,
} from "../dashboard/module/user-management/subclient/services";
import { roleApi } from "../dashboard/module/hrm/role/services/roleApi";
import roleReducer from "../dashboard/module/hrm/role/services/roleSlice";
import { userApi } from "../dashboard/module/user-management/users/services/userApi";
import {
  employeeApi,
  employeeReducer,
} from "../dashboard/module/hrm/Employee/services";
import {
  designationApi,
  designationReducer,
} from "../dashboard/module/hrm/Designation/services";
import {
  branchApi,
  branchReducer,
} from "../dashboard/module/hrm/Branch/services";
import {
  departmentApi,
  departmentReducer,
} from "../dashboard/module/hrm/Department/services";
import {
  trainingApi,
  trainingReducer,
} from "../dashboard/module/hrm/Training/services";
import {
  esignatureApi,
  esignatureReducer,
} from "../superadmin/module/settings/eSignature/services/index";
import { pipelineApi } from "../dashboard/module/crm/crmsystem/pipeline/services/pipelineApi";
import pipelineReducer from "../dashboard/module/crm/crmsystem/pipeline/services/pipelineSlice";
import { leadStageApi } from "../dashboard/module/crm/crmsystem/leadstage/services/leadStageApi";
import { dealStageApi } from "../dashboard/module/crm/crmsystem/dealstage/services/dealStageApi";
import { sourceApi } from "../dashboard/module/crm/crmsystem/souce/services/SourceApi";
import { lableApi } from "../dashboard/module/crm/crmsystem/lable/services/LableApi";
import { contractTypeApi } from "../dashboard/module/crm/crmsystem/contractType/services/ContractTypeApi";
import contractTypeReducer from "../dashboard/module/crm/crmsystem/contractType/services/ContractTypeSlice";
import { taskApi, taskReducer } from "../dashboard/module/crm/task/services";
import { projectApi } from '../dashboard/module/crm/project/services/projectApi';
import projectReducer from '../dashboard/module/crm/project/services/projectSlice';
import { jobApi, jobReducer } from "../dashboard/module/job/jobs/services";
import { jobApplicationApi, jobApplicationReducer } from "../dashboard/module/job/job applications/services";
import { jobOnboardingApi, jobOnboardingReducer } from "../dashboard/module/job/job onboarding/services";
import { offerLetterApi, offerLetterReducer } from '../dashboard/module/job/offer letters/services';
import { interviewApi, interviewReducer } from '../dashboard/module/job/interviews/services';
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
  [roleApi.reducerPath]: roleApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [employeeApi.reducerPath]: employeeApi.reducer,
  [designationApi.reducerPath]: designationApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
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
  company: companyReducer,
  superadminProfile: superadminProfileReducer,
  settings: settingsReducer,
  plan: planReducer,
  policy: policyReducer,
  inquiry: inquiryReducer,
  esignature: esignatureReducer,
  subclient: subclientReducer,
  role: roleReducer,
  branch: branchReducer,
  employee: employeeReducer,
  designation: designationReducer,
  department: departmentReducer,
  training: trainingReducer,
  pipeline: pipelineReducer,
  contractType: contractTypeReducer,
  task: taskReducer,
  project: projectReducer,
  job: jobReducer,
  jobApplication: jobApplicationReducer,
  jobOnboarding: jobOnboardingReducer,
  offerLetter: offerLetterReducer,
  interview: interviewReducer,
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
      .concat(subclientApi.middleware)
      .concat(roleApi.middleware)
      .concat(userApi.middleware)
      .concat(branchApi.middleware)
      .concat(employeeApi.middleware)
      .concat(designationApi.middleware)
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
      .concat(interviewApi.middleware),
});

export const persistor = persistStore(store);
export default store;
