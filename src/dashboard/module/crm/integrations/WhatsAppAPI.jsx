import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiPhone } from "react-icons/fi";
import { message } from "antd";

const WhatsAppAPIIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving WhatsApp API config:", values);
    message.success("WhatsApp Business API configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="WhatsApp API"
      subtitle="Send automated WhatsApp messages to your leads"
      icon={<FiPhone size={24} color="#25d366" />}
      description="Connect your Meta WhatsApp Business API to send automated notifications, templates, and messages directly from the CRM."
      fields={[
        { name: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'Enter your WhatsApp Phone Number ID', required: true },
        { name: 'wabaId', label: 'WABA ID', placeholder: 'Enter your WhatsApp Business Account ID', required: true },
        { name: 'accessToken', label: 'Permanent Access Token', placeholder: 'Enter your Meta System User Access Token', required: true, type: 'password', fullWidth: true },
      ]}
      webhookUrl="/webhooks/whatsapp/your-unique-token"
      onSave={handleSave}
    />
  );
};

export default WhatsAppAPIIntegration;
