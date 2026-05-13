import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiLink } from "react-icons/fi";
import { message } from "antd";

const WebhooksIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Webhook config:", values);
    message.success("Webhook configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Website Webhooks"
      subtitle="Connect any website form to your CRM"
      icon={<FiLink size={24} color="#722ed1" />}
      description="Use our generic webhook to capture leads from any website form (WordPress, Elementor, Custom Forms). Simply send a POST request with lead data to the URL below."
      fields={[
        { name: 'formName', label: 'Form Name', placeholder: 'e.g., Contact Us Page', required: true },
        { name: 'secretKey', label: 'Webhook Secret', placeholder: 'Generate or enter a secret key', required: true, type: 'password' },
      ]}
      webhookUrl="/webhooks/generic/your-unique-token"
      onSave={handleSave}
    />
  );
};

export default WebhooksIntegration;
