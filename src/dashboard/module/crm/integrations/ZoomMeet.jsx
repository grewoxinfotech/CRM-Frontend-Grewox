import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiVideo } from "react-icons/fi";
import { message } from "antd";

const ZoomMeetIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Zoom Meet config:", values);
    message.success("Zoom Meet configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Zoom Meet"
      subtitle="Schedule and host Zoom meetings directly from Grewox CRM"
      icon={<FiVideo size={24} color="#2D8CFF" />}
      description="Connect your Zoom Account using OAuth or Server-to-Server App credentials. This will enable you to create and manage Zoom meetings for your follow-ups."
      fields={[
        { name: 'accountId', label: 'Account ID', placeholder: 'Enter your Zoom Account ID', required: true },
        { name: 'clientId', label: 'Client ID', placeholder: 'Enter your Zoom Client ID', required: true },
        { name: 'clientSecret', label: 'Client Secret', placeholder: 'Enter your Zoom Client Secret', required: true, type: 'password', fullWidth: true },
      ]}
      onSave={handleSave}
    />
  );
};

export default ZoomMeetIntegration;
