import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Tabs,
  Breadcrumb,
  Button,
  Typography,
  Space,
  message,
} from "antd";
import {
  FiArrowLeft,
  FiHome,
  FiBriefcase,
  FiUsers,
  FiFile,
  FiFlag,
  FiCheckSquare,
  FiFileText,
  FiDollarSign,
  FiCreditCard,
  FiBookmark,
  FiActivity,
  FiCheck,
  FiX,
  FiTarget,
} from "react-icons/fi";

import CompanyOverview from "./overview/index";
import CompanyDealList from "./overview/companydeals";
import CompanyContactList from "./overview/companycontacts";
// import CompanyContacts from './overview/contacts';
// import CompanyFiles from './overview/files';
// import CompanyInvoices from './overview/invoices';
// import CompanyPayments from './overview/payments';
// import CompanyNotes from './overview/notes';
// import CompanyActivity from './overview/activity';
import "./companyaccount.scss";
import PageHeader from "../../../../components/PageHeader";
import {
  useGetCompanyAccountsQuery,
  useUpdateCompanyAccountMutation,
} from "./services/companyAccountApi";
import CompanyLeadsList from "./overview/companyleads";

const { Title, Text } = Typography;

const CompanyAccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetCompanyAccountsQuery();
  const [updateCompanyAccount] = useUpdateCompanyAccountMutation();

  // Get companies array first
  const companies = data && Array.isArray(data.data) ? data.data : [];
  // Then find the company
  const company = companies.find((company) => company.id === accountId);

  // Use useEffect to update currentStatus when company data changes
  const [currentStatus, setCurrentStatus] = useState("active");

  React.useEffect(() => {
    if (company?.status) {
      setCurrentStatus(company.status);
    }
  }, [company]);

  const handleStatusChange = async (status) => {
    try {
      await updateCompanyAccount({
        id: accountId,
        status: status,
      }).unwrap();

      setCurrentStatus(status);
      message.success(`Company status updated to ${status}`);
    } catch (error) {
      message.error("Failed to update company status");
    }
  };

  const items = [
    {
      key: "overview",
      label: (
        <span className="nav-item">
          <FiBriefcase className="nav-icon" /> Overview
        </span>
      ),
      children: (
        <CompanyOverview company={company} currentStatus={currentStatus} />
      ),
    },
    {
      key: "companyleads",
      label: (
        <span className="nav-item">
          <FiUsers className="nav-icon" /> Company Leads
        </span>
      ),
      children: (
        <CompanyLeadsList company={company} currentStatus={currentStatus} />
      ),
    },
    {
      key: "companydeals",
      label: (
        <span className="nav-item">
          <FiBriefcase className="nav-icon" /> Company Deals
        </span>
      ),
      children: (
        <CompanyDealList company={company} currentStatus={currentStatus} />
      ),
    },
    {
      key: "contacts",
      label: (
        <span className="nav-item">
          <FiUsers className="nav-icon" /> Company Contacts
        </span>
      ),
      children: <CompanyContactList company={company} />,
    },

    // {
    //     key: 'files',
    //     label: (
    //         <span className="nav-item">
    //             <FiFile className="nav-icon" /> Files
    //         </span>
    //     ),
    //     children: <CompanyFiles company={company} />,
    // },
    // {
    //     key: 'invoices',
    //     label: (
    //         <span className="nav-item">
    //             <FiFileText className="nav-icon" /> Invoices
    //         </span>
    //     ),
    //     children: <CompanyInvoices company={company} />,
    // },
    // {
    //     key: 'payments',
    //     label: (
    //         <span className="nav-item">
    //             <FiCreditCard className="nav-icon" /> Payments
    //         </span>
    //     ),
    //     children: <CompanyPayments company={company} />,
    // },
    // {
    //     key: 'notes',
    //     label: (
    //         <span className="nav-item">
    //             <FiBookmark className="nav-icon" /> Notes
    //         </span>
    //     ),
    //     children: <CompanyNotes company={company} />,
    // },
    // {
    //     key: 'activity',
    //     label: (
    //         <span className="nav-item">
    //             <FiActivity className="nav-icon" /> Activity
    //         </span>
    //     ),
    //     children: <CompanyActivity company={company} />,
    // },
  ];

  return (
    <div className="project-page">
      <PageHeader
        title={company?.company_name || "Company Details"}
        subtitle="Manage company details and activities"
        breadcrumbItems={[
          {
            title: (
              <Link to="/dashboard">
                <FiHome style={{ marginRight: "4px" }} /> Home
              </Link>
            ),
          },
          {
            title: (
              <Link to="/dashboard/crm/company-account">
                <FiBriefcase style={{ marginRight: "4px" }} /> Companies
              </Link>
            ),
          },
          {
            title: company?.company_name || "Company Details",
          },
        ]}
        extraActions={
          <Space>
            <Button
              type="primary"
              icon={<FiArrowLeft />}
              onClick={() => navigate("/dashboard/crm/company-account")}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                height: "30px",
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                fontWeight: "500",
              }}
            >
              Back
            </Button>
          </Space>
        }
      />

      <Card loading={isLoading}>
        <Tabs
          defaultActiveKey="overview"
          items={items}
          className="project-tabs"
          type="card"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
        />
      </Card>
    </div>
  );
};

export default CompanyAccountDetails;
