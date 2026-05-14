import React, { useEffect } from "react";
import IntegrationPage from "./IntegrationPage";
import { FiTarget } from "react-icons/fi";
import { message, Spin } from "antd";
import { useGetWhatsappSettingsQuery, useSaveWhatsappSettingsMutation } from "../../settings/services/settingsApi";
import { WHATSAPP_WEBHOOK_URL } from "../../../../config/config";
import { Form } from "antd";

const MetaAdsIntegration = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useGetWhatsappSettingsQuery();
  const [saveSettings, { isLoading: isSaving }] = useSaveWhatsappSettingsMutation();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        facebook_page_id: settings.facebook_page_id,
        access_token: settings.access_token,
        verify_token: settings.verify_token,
        enabled: settings.is_active
      });
    }
  }, [settings, form]);

  const handleSave = async (values) => {
    try {
      // The backend expects is_active, but the form field is 'enabled' in IntegrationPage
      const payload = {
        ...values,
        is_active: values.enabled !== false
      };
      await saveSettings(payload).unwrap();
      message.success("Meta Ads configuration saved successfully");
    } catch (error) {
      message.error(error?.data?.message || "Failed to save configuration");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <IntegrationPage
      form={form}
      title="Meta Ads"
      subtitle="Capture leads from Facebook and Instagram Ads"
      icon={<FiTarget size={24} color="#1877f2" />}
      description="Connect your Facebook Page to automatically capture leads from your Lead Generation forms. This integration uses the same underlying connection as your WhatsApp Business API."
      status={settings?.is_active ? "connected" : "disconnected"}
      fields={[
        { 
          name: 'facebook_page_id', 
          label: 'Facebook Page ID', 
          placeholder: 'Enter your Facebook Page ID', 
          required: true 
        },
        { 
          name: 'access_token', 
          label: 'System User Access Token', 
          placeholder: 'Enter your Meta System User Access Token', 
          required: true, 
          type: 'password', 
          fullWidth: true 
        },
        { 
          name: 'verify_token', 
          label: 'Webhook Verify Token', 
          placeholder: 'Enter a custom verify token (e.g. my_secret_token)', 
          required: true 
        },
      ]}
      webhookUrl={WHATSAPP_WEBHOOK_URL || "/api/v1/whatsapp/webhook"}
      onSave={handleSave}
    />
  );
};


export default MetaAdsIntegration;

