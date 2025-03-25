import { createBrowserRouter } from "react-router-dom";
import Login from "../auth/login";
import AuthRedirect from "./AuthRedirect/index.jsx";
import DashboardLayout from "../dashboard/layout";
import Dashboard from "../dashboard";
import SuperAdminLayout from "../superadmin/layout";
import SuperAdminDashboard from "../superadmin/module/dashboard";
import Company from "../superadmin/module/company";
import Policy from "../superadmin/module/policy";
import Profile from "../superadmin/module/profile/index.jsx";
import Currencies from "../superadmin/module/settings/currencies/index.jsx";
import Countries from "../superadmin/module/settings/countries/index.jsx";
import Plans from "../superadmin/module/plans/index.jsx";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../auth/forgot-password";
import Branch from "../dashboard/module/hrm/Branch";
import OTPVerification from "../auth/otp";
import RoleBasedRoute from "./RoleBasedRoute";
import Notes from "../superadmin/module/notes/index.jsx";
import ESignature from "../superadmin/module/settings/eSignature/index.jsx";
import Inquiry from "../superadmin/module/inquary/index.jsx";
import SubClient from "../dashboard/module/user-management/subclient/index.jsx";
import Designation from "../dashboard/module/hrm/Designation";
import Department from "../dashboard/module/hrm/Department";
import Training from "../dashboard/module/hrm/Training";
import Document from "../dashboard/module/hrm/Document";
import Announcement from "../dashboard/module/hrm/Announcement";
import Role from "../dashboard/module/hrm/role";
import Users from "../dashboard/module/user-management/users/index.jsx";
import Employee from "../dashboard/module/hrm/Employee/index.jsx";
import Job from "../dashboard/module/job/jobs/index.jsx";
import JobCandidates from "../dashboard/module/job/job candidates/index.jsx";
import JobOnboarding from "../dashboard/module/job/job onboarding/index.jsx";
import JobApplications from "../dashboard/module/job/job applications/index.jsx";
import OfferLetters from "../dashboard/module/job/offer letters/index.jsx";
import Interviews from "../dashboard/module/job/interviews/index.jsx";
import Lead from "../dashboard/module/crm/lead/index.jsx";
import Deal from "../dashboard/module/crm/deal/index.jsx";
import Crmsystem from "../dashboard/module/crm/crmsystem/index.jsx";
import Task from "../dashboard/module/crm/task/index.jsx";
import Project from "../dashboard/module/crm/project/index.jsx";
import ProjectDetail from "../dashboard/module/crm/project/ProjectDetail";
import Customer from "../dashboard/module/sales/customer/index.jsx";
import { useSelector } from 'react-redux';
import { parsePermissions, hasPermission } from '../utils/permissionUtils';
import { Navigate } from 'react-router-dom';
import { selectUserRole } from '../auth/services/authSlice';
import Invoice from "../dashboard/module/sales/invoice/index.jsx";
import ProductServices from "../dashboard/module/sales/product&services/index.jsx";
import Meeting from "../dashboard/module/hrm/Meeting/index.jsx";
import Revenue from "../dashboard/module/sales/revenue/index.jsx";
import CreditNotes from "../dashboard/module/sales/creditnotes/index.jsx";
import Calendar from "../dashboard/module/communication/calendar/index.jsx";
import TaskCalendar from "../dashboard/module/crm/taskcalendar/index.jsx";
  const PermissionRoute = ({ children, permissionKey }) => {
  const userRole = useSelector(selectUserRole);
  const permissions = parsePermissions(userRole?.permissions);

  if (!hasPermission(permissions, permissionKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/otp",
    element: <OTPVerification />,
  },
  {
    path: "/auth-redirect",
    element: (
      <ProtectedRoute>
        <AuthRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute >
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/clients",
        element: <SubClient />,
      },
      {
        path: "customers",
        element: <div>Customers Page</div>,
      },
      {
        path: "products",
        element: <div>Products Page</div>,
      },
      {
        path: "analytics",
        element: <div>Analytics Page</div>,
      },
      {
        path: "hrm",
        children: [
          {
            path: "employee",
            element: <Employee />,
          },
          {
            path: "branch",
            element: <Branch />,
          },
          {
            path: "designation",
            element: <Designation />,
          },
          {
            path: "department",
            element: <Department />,
          },
          {
            path: "training",
            element: <Training />,
          },
          {
            path: "document",
            element: <Document />,
          },
          {
            path: "announcement",
            element: <Announcement />,
          },
          {
            path: "role",
            element: <Role />,
          },
          {
            path:"meeting",
            element:<Meeting/>
          }
        ],
      },
      {
        path: "job",
        children: [
          {
            path: "jobs",
            element: <Job />,
          },
          {
            path: "job-candidates",
            element: <JobCandidates />,
          },
          {
            path: "job-onboarding",
            element: <JobOnboarding />,
          },
          {
            path: "job-applications",
            element: <JobApplications />,
          },
          {
            path: "offer-letters",
            element: <OfferLetters />,
          },
          {
            path: "interviews",
            element: <Interviews />,
          },
        ],
      },
      {
        path: "crm",
        children: [
          {
            path: "project",
            children: [
              {
                path: "",
                element: <Project />,
              },
              {
                path: ":projectId",
                element: <ProjectDetail />,
              }
            ]
          },
          {
            path: "leads",
            element: <Lead />,
          },
          {
            path: "deals",
            element: <Deal />,
          },
          {
            path: "tasks",
            element: <Task />,
          },
          {
            path: "task-calendar",
            element: <TaskCalendar />,
          },
        ],
      },
      {
        path: "sales",
        children: [
          {
            path: "product-services",
            element: <ProductServices />,
          },
          {
            path: "customer",
            element: <Customer />,
          },
          {
            path: "invoice",
            element: <Invoice />,
          },
          {
            path: "revenue",
            element: <Revenue />,
          },
          {
            path: "credit-notes",
            element: <CreditNotes />,
          }
        ],
      },
      {
        path: "communication",
        children: [
          {
            path: "calendar",
            element: <Calendar/>,
          }
        ]
      },
      {
        path: "user-management/users",
        element: <Users />,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
      {
        path: "help",
        element: <div>Help & Support Page</div>,
      },
      {
        path: "crm-setup",
        element: <Crmsystem />,
      },
    ],
  },
  {
    path: "/superadmin",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute>
          <SuperAdminLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <SuperAdminDashboard />,
      },
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "company",
        element: <Company />,
      },
      {
        path: "notes",
        element: <Notes />,
      },
      {
        path: "policy",
        element: <Policy />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
      {
        path: "settings/currencies",
        element: <Currencies />,
      },
      {
        path: "settings/countries",
        element: <Countries />,
      },
      {
        path: "settings/esignature",
        element: <ESignature />,
      },
      {
        path: "inquiry",
        element: <Inquiry />,
      },
    ],
  },
]);

export default routes;
