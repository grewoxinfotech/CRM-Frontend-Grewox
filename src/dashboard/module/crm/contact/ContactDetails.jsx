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

import ContactOverview from "./overview/index";
import ContactDealList from "./overview/contactdeals/index";
import ContactLeadsList from "./overview/contactleads/index";
import "./contact.scss";
import PageHeader from "../../../../components/PageHeader";
import {
  useGetContactsQuery,
  useUpdateContactMutation,
} from "./services/contactApi";

const { Title, Text } = Typography;

const ContactDetails = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetContactsQuery();
  const [updateContact] = useUpdateContactMutation();

  const contacts = data && Array.isArray(data.data) ? data.data : [];
  const contact = contacts.find((contact) => contact.id === contactId);

  const [currentStatus, setCurrentStatus] = useState("active");

  React.useEffect(() => {
    if (contact?.status) {
      setCurrentStatus(contact.status);
    }
  }, [contact]);

  const handleStatusChange = async (status) => {
    try {
      await updateContact({
        id: contactId,
        status: status,
      }).unwrap();

      setCurrentStatus(status);
      message.success(`Contact status updated to ${status}`);
    } catch (error) {
      message.error("Failed to update contact status");
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
        <ContactOverview contact={contact} currentStatus={currentStatus} />
      ),
    },
    {
      key: "contactleads",
      label: (
        <span className="nav-item">
          <FiBriefcase className="nav-icon" /> Contact Leads
        </span>
      ),
      children: (
        <ContactLeadsList contact={contact} currentStatus={currentStatus} />
      ),
    },
    {
      key: "contactdeals",
      label: (
        <span className="nav-item">
          <FiBriefcase className="nav-icon" /> Contact Deals
        </span>
      ),
      children: (
        <ContactDealList contact={contact} currentStatus={currentStatus} />
      ),
    },
  ];

  return (
    <div className="project-page">
      <PageHeader
        title={contact?.name || "Contact Details"}
        subtitle="Manage contact details and activities"
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
              <Link to="/dashboard/crm/contact">
                <FiUsers style={{ marginRight: "4px" }} /> Contacts
              </Link>
            ),
          },
          {
            title: contact?.name || "Contact Details",
          },
        ]}
        extraActions={
          <Space>
            <Button
              type="primary"
              icon={<FiArrowLeft />}
              onClick={() => navigate("/dashboard/crm/contact")}
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
          className="contact-tabs"
          type="card"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
        />
      </Card>
    </div>
  );
};

export default ContactDetails;
