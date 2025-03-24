import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/services/authSlice";
import { authApi } from "../auth/services/authApi";
import { documentApi } from "../dashboard/module/hrm/Document/services/documentApi";
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
import { subclientApi } from "../dashboard/module/user-management/subclient/services/subClientApi";
import { roleApi } from "../dashboard/module/hrm/role/services/roleApi";
import { userApi } from "../dashboard/module/user-management/users/services/userApi";
import { employeeApi } from "../dashboard/module/hrm/Employee/services";
import { designationApi } from "../dashboard/module/hrm/Designation/services/designationApi";
import { branchApi } from "../dashboard/module/hrm/Branch/services/branchApi";
import { departmentApi } from "../dashboard/module/hrm/Department/services/departmentApi";
import { trainingApi } from "../dashboard/module/hrm/Training/services";
import { esignatureApi } from "../superadmin/module/settings/eSignature/services/index";
import { pipelineApi } from "../dashboard/module/crm/crmsystem/pipeline/services/pipelineApi";
import { leadStageApi } from "../dashboard/module/crm/crmsystem/leadstage/services/leadStageApi";
import { dealStageApi } from "../dashboard/module/crm/crmsystem/dealstage/services/dealStageApi";
import { sourceApi } from "../dashboard/module/crm/crmsystem/souce/services/SourceApi";
import { lableApi } from "../dashboard/module/crm/crmsystem/lable/services/LableApi";
import { contractTypeApi } from "../dashboard/module/crm/crmsystem/contractType/services/ContractTypeApi";
import { taskApi } from "../dashboard/module/crm/task/services/taskApi";
import { projectApi } from "../dashboard/module/crm/project/services/projectApi";
import projectReducer from "../dashboard/module/crm/project/services/projectSlice";
import { jobApi, jobReducer } from "../dashboard/module/job/jobs/services";
import {
  jobApplicationApi,
  jobApplicationReducer,
} from "../dashboard/module/job/job applications/services";
import {
  jobOnboardingApi,
  jobOnboardingReducer,
} from "../dashboard/module/job/job onboarding/services";
import {
  offerLetterApi,
  offerLetterReducer,
} from "../dashboard/module/job/offer letters/services";
import {
  interviewApi,
  interviewReducer,
} from "../dashboard/module/job/interviews/services";
import { leadApi } from "../dashboard/module/crm/lead/services/LeadApi";
import leadReducer from "../dashboard/module/crm/lead/services/leadSlice";
import { dealApi } from "../dashboard/module/crm/deal/services/DealApi";
import dealReducer from "../dashboard/module/crm/deal/services/dealSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  company: companyReducer,
  superadminProfile: superadminProfileReducer,
  settings: settingsReducer,
  plan: planReducer,
  policy: policyReducer,
  inquiry: inquiryReducer,
  project: projectReducer,
  job: jobReducer,
  jobApplication: jobApplicationReducer,
  jobOnboarding: jobOnboardingReducer,
  offerLetter: offerLetterReducer,
  interview: interviewReducer,
  lead: leadReducer,
  deal: dealReducer,
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
