import React from "react";
import IntegrationPage from "./IntegrationPage";
import { FiTarget } from "react-icons/fi";
import { message } from "antd";

const MetaAdsIntegration = () => {
  const handleSave = (values) => {
    console.log("Saving Meta Ads config:", values);
    message.success("Meta Ads configuration saved successfully");
  };

  return (
    <IntegrationPage
      title="Meta Ads"
      subtitle="Capture leads from Facebook and Instagram Ads"
      icon={<FiTarget size={24} color="#1877f2" />}
      description="Connect your Facebook Page and Ad Account to automatically capture leads from your Lead Generation forms on Facebook and Instagram."
      fields={[
        { name: 'pixelId', label: 'Pixel ID', placeholder: 'Enter your Facebook Pixel ID', required: true },
        { name: 'accessToken', label: 'Access Token', placeholder: 'Enter your Meta System User Access Token', required: true, type: 'password', fullWidth: true },
        { name: 'adAccountId', label: 'Ad Account ID', placeholder: 'Enter your Ad Account ID (act_...)', required: true },
      ]}
      webhookUrl="/webhooks/meta-ads/your-unique-token"
      onSave={handleSave}
    />
  );
};

export default MetaAdsIntegration;
