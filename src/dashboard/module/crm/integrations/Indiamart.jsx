import React from "react";
import ComingSoon from "../../../../components/ComingSoon";
import { FiShoppingCart } from "react-icons/fi";

const IndiamartIntegration = () => {
  return (
    <ComingSoon 
      title="IndiaMART" 
      icon={<FiShoppingCart size={64} color="#fa541c" />} 
    />
  );
};

/* 
ORIGINAL WORKING CODE PRESERVED BELOW:

import React, { useState, useEffect } from "react";
import IntegrationPage from "./IntegrationPage";
import { FiShoppingCart, FiRefreshCw } from "react-icons/fi";
import { message, Button } from "antd";
import { BASE_URL } from "../../../../config/config";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../../../../auth/services/authSlice";

const IndiamartIntegration = () => {
  const token = useSelector(selectCurrentToken);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/integrations/indiamart/settings`, {
        headers: { 'authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
        setWebhookUrl(result.webhookUrl);
      }
    } catch (err) {
      console.error("Failed to fetch Indiamart settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/integrations/indiamart/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(values)
      });
      const result = await res.json();
      if (result.success) {
        message.success("Indiamart configuration saved successfully");
        setSettings(result.data);
        if (result.webhookUrl) setWebhookUrl(result.webhookUrl);
      } else {
        message.error(result.message || "Failed to save settings");
      }
    } catch (err) {
      message.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${BASE_URL}/integrations/indiamart/sync`, {
        method: 'POST',
        headers: { 'authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message || "Sync failed");
      }
    } catch (err) {
      message.error("Error during sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="indiamart-integration">
      <IntegrationPage
        title="Indiamart"
        subtitle="Sync your Indiamart lead manager with Grewox CRM"
        icon={<FiShoppingCart size={24} color="#fa541c" />}
        webhookUrl={webhookUrl}
        description={
          <div>
            <p>Connect your Indiamart account using your CRM Key or by setting up the Webhook URL in your Indiamart Seller Panel.</p>
            <Button 
              type="primary" 
              icon={<FiRefreshCw className={syncing ? "anticon-spin" : ""} />} 
              onClick={handleSync}
              loading={syncing}
              disabled={!settings?.isActive}
              style={{ marginTop: 10, background: '#fa541c', borderColor: '#fa541c' }}
            >
              Sync Now
            </Button>
          </div>
        }
        fields={[
          { name: 'crm_key', label: 'CRM Key', placeholder: 'Enter your Indiamart CRM Key', required: true, type: 'password', initialValue: settings?.crm_key },
          { name: 'mobile_number', label: 'Mobile Number', placeholder: 'Enter registered mobile number', required: true, initialValue: settings?.mobile_number },
          { name: 'isActive', label: 'Active', type: 'switch', initialValue: settings?.isActive ?? true },
          { name: 'autoSync', label: 'Auto Sync (Every 30 min)', type: 'switch', initialValue: settings?.autoSync ?? true },
        ]}
        onSave={handleSave}
        loading={loading}
        initialValues={settings}
      />
    </div>
  );
};
*/

export default IndiamartIntegration;
