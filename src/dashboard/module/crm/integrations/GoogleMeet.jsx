import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiVideo } from "react-icons/fi";
import { message, Button } from "antd";

const GoogleMeetIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Google Meet config:", values);
    message.success("Google Meet configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Google Meet"
      subtitle="Schedule and launch meetings directly from CRM"
      icon={<FiVideo size={24} color="#34a853" />}
      description="Connect your Google Workspace or Personal Google account to enable Google Meet scheduling for your follow-ups and meetings."
      fields={[
        { name: 'clientId', label: 'OAuth Client ID', placeholder: 'Enter your Google Client ID', required: true, fullWidth: true },
        { name: 'clientSecret', label: 'OAuth Client Secret', placeholder: 'Enter your Google Client Secret', required: true, type: 'password', fullWidth: true },
      ]}
      onSave={handleSave}
    />
  );
};

export default GoogleMeetIntegration;
