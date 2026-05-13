import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiGlobe } from "react-icons/fi";
import { message } from "antd";

const JustdialIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Justdial config:", values);
    message.success("Justdial configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Justdial"
      subtitle="Connect your Justdial business account to sync leads"
      icon={<FiGlobe size={24} color="#1890ff" />}
      description="Justdial integration allows you to automatically pull leads from your Justdial business listing into Grewox CRM. Simply enter your credentials and copy the webhook URL into your Justdial dashboard."
      fields={[
        { name: 'username', label: 'Justdial Username', placeholder: 'Enter your username', required: true },
        { name: 'apiKey', label: 'API Key', placeholder: 'Enter Justdial API Key', required: true, type: 'password' },
        { name: 'businessId', label: 'Business ID', placeholder: 'Enter your Justdial Business ID', required: true },
      ]}
      webhookUrl="/webhooks/justdial/your-unique-token"
      onSave={handleSave}
    />
  );
};

export default JustdialIntegration;
