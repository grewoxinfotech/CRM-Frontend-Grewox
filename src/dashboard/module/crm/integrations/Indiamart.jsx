import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiShoppingCart } from "react-icons/fi";
import { message } from "antd";

const IndiamartIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Indiamart config:", values);
    message.success("Indiamart configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Indiamart"
      subtitle="Sync your Indiamart lead manager with Grewox CRM"
      icon={<FiShoppingCart size={24} color="#fa541c" />}
      description="Connect your Indiamart account using your CRM Key. This will allow Grewox CRM to fetch all your inquiries and leads from the Indiamart Lead Manager in real-time."
      fields={[
        { name: 'crmKey', label: 'CRM Key', placeholder: 'Enter your Indiamart CRM Key', required: true, type: 'password' },
        { name: 'mobileNumber', label: 'Mobile Number', placeholder: 'Enter registered mobile number', required: true },
      ]}
      onSave={handleSave}
    />
  );
};

export default IndiamartIntegration;
