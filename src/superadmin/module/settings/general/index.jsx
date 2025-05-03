import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Typography,
  Card,
  Space,
  Row,
  Col,
  Modal,
  message,
  Divider,
  Tooltip,
  Alert,
} from "antd";
import {
  UploadOutlined,
  HomeOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  BuildOutlined,
  EyeOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  useCreateSettingMutation,
  useGetAllSettingsQuery,
  useDeleteSettingMutation,
  useUpdateSettingMutation,
} from "./services/settingApi";
import { applySiteSettings } from "../../../../utils/siteSettings";
import "./general.scss";
import { FiX } from "react-icons/fi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;

const GeneralSettings = () => {
  const [form] = Form.useForm();
  const [termsContent, setTermsContent] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedFavicon, setSelectedFavicon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const loggedInUser = useSelector(selectCurrentUser);
  const id = loggedInUser?.id;

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useGetAllSettingsQuery(id);

  const [createSetting] = useCreateSettingMutation();
  const [updateSetting] = useUpdateSettingMutation();
  const [deleteSetting] = useDeleteSettingMutation();

  // Initialize form with termsContent
  useEffect(() => {
    form.setFieldsValue({ termsandconditions: termsContent });
  }, [termsContent, form]);

  // Load existing settings if available
  useEffect(() => {
    if (
      settingsData?.success &&
      settingsData?.data &&
      settingsData.data.length > 0
    ) {
      const existingSettings = settingsData.data[0];

      setSavedData(existingSettings);
      setIsViewMode(true);

      // Set form values
      form.setFieldsValue({
        companyName: existingSettings.companyName,
        title: existingSettings.title,
        termsandconditions: existingSettings.termsandconditions,
        merchant_name: existingSettings.merchant_name,
        merchant_upi_id: existingSettings.merchant_upi_id,
      });

      setTermsContent(existingSettings.termsandconditions || "");

      // Apply site settings
      applySiteSettings({
        // favicon: existingSettings.favicon,
        // title: existingSettings.title,
        companyName: existingSettings.companyName,
      });
    }
  }, [settingsData, form]);

  const onFinish = (values) => {
    console.log("Form values:", values);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      return false;
    },
    maxCount: 1,
  };

  const showPreview = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        termsContent,
      };
      setSavedData(formData);
      setIsViewMode(true);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate form fields
      const values = await form.validateFields();

      // Check if required files are present
      if (!selectedLogo) {
        message.error("Company logo is required");
        return;
      }

      // Create FormData object for file uploads
      const formData = new FormData();

      // Add required fields with exact field names matching backend
      formData.append("companyName", values.companyName);
      formData.append("title", values.title);

      // Add terms and conditions
      formData.append("termsandconditions", termsContent || "");

      // Add merchant fields
      formData.append("merchant_name", values.merchant_name || "");
      formData.append("merchant_upi_id", values.merchant_upi_id || "");
      formData.append("bank_name", values.bank_name || "");
      formData.append("account_holder_name", values.account_holder_name || "");
      formData.append("account_number", values.account_number || "");
      formData.append("ifsc_code", values.ifsc_code || "");
      formData.append("bank_branch", values.bank_branch || "");

      // Add files
      formData.append("companylogo", selectedLogo);

      // Create a plain object to show the payload structure
      const payloadObject = {
        companyName: values.companyName,
        title: values.title,
        termsandconditions: termsContent,
        merchant_name: values.merchant_name,
        merchant_upi_id: values.merchant_upi_id,
        companylogo: selectedLogo ? selectedLogo.name : null,
        favicon: selectedFavicon ? selectedFavicon.name : null,
      };

      // Call the API with the FormData
      const response = await createSetting({ id, data: formData }).unwrap();

      if (response.success) {
        // Update the saved data with the response
        const updatedSettings = {
          ...values,
          termsandconditions: termsContent,
          companylogo: response.data?.companylogo,
          favicon: response.data?.favicon,
        };
        setSavedData(updatedSettings);
        setIsViewMode(true);
        message.success("Settings saved successfully!");

        // Apply site settings with the updated data
        applySiteSettings({
          favicon: response.data?.favicon,
          title: values.title,
          companyName: values.companyName,
        });

        // Refetch settings to update the UI
        refetchSettings();
      } else {
        message.error(response.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error(error?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!savedData || !savedData.id) {
      message.error("No settings found to delete");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete these settings?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          // Log the ID for debugging
          console.log("Deleting settings with ID:", savedData.id);
          const response = await deleteSetting(savedData.id).unwrap();

          if (response.success) {
            setSavedData(null);
            setIsViewMode(false);
            form.resetFields();
            setTermsContent("");
            message.success("Settings deleted successfully!");
            refetchSettings();
          } else {
            message.error(response.message || "Failed to delete settings");
          }
        } catch (error) {
          console.error("Error deleting settings:", error);
          message.error(error?.data?.message || "Failed to delete settings");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFileChange = (info, type) => {
    const file = info.file;
    if (file) {
      if (type === "logo") {
        setSelectedLogo(file);
      } else if (type === "favicon") {
        setSelectedFavicon(file);
      }
      message.success(`${file.name} selected successfully`);
    }
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Create FormData object for file uploads
      const formData = new FormData();

      // Add required fields
      formData.append("companyName", values.companyName);
      formData.append("title", values.title || savedData.title); // Keep existing title if not changed

      // Add terms and conditions if changed
      if (values.termsandconditions?.trim()) {
        formData.append("termsandconditions", values.termsandconditions);
      }

      // Add merchant fields
      formData.append("merchant_name", values.merchant_name || "");
      formData.append("merchant_upi_id", values.merchant_upi_id || "");

      // Handle company logo
      if (selectedLogo) {
        // If a new logo is selected, append it
        formData.append("companylogo", selectedLogo);
      } else if (savedData?.companylogo) {
        // If no new logo is selected but there's an existing one, append the existing logo URL
        formData.append("companylogo", savedData.companylogo);
      }

      // Log the FormData contents for debugging
      console.log("Update FormData contents:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
        );
      }

      // Call the update API with the ID and FormData
      const response = await updateSetting({
        id: savedData.id,
        data: formData,
      }).unwrap();

      if (response.success) {
        // Update the saved data with the response
        const updatedSettings = {
          ...values,
          id: savedData.id, // Preserve the ID
          companylogo: response.data?.companylogo || savedData?.companylogo,
          favicon: response.data?.favicon || savedData?.favicon,
        };
        setSavedData(updatedSettings);
        setIsEditModalVisible(false);
        message.success("Settings updated successfully!");

        // Apply site settings with the updated data
        applySiteSettings({
          favicon: response.data?.favicon || savedData?.favicon,
          title: values.title || savedData?.title,
          companyName: values.companyName,
        });

        // Reset file selections
        setSelectedLogo(null);
        setSelectedFavicon(null);

        // Refetch settings to update the UI
        refetchSettings();
      } else {
        message.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error(error?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const ViewPage = () => (
    <div className="view-page">
      <div className="view-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Current Settings</h1>
            <p>View your general settings configuration</p>
          </div>
          <div className="header-actions">
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="primary" 
                style={{
                  height: "40px",
                }}
              >
                Edit
              </Button>
              <Button icon={<DeleteOutlined />} onClick={handleDelete} danger style={{
                  height: "40px",
                }}
              >
                Delete
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="view-content">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Company Information" className="view-card">
              <Row gutter={[24, 24]}>
                <Col span={24} lg={8}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: "10px" }}>Company Logo</h4>
                    {savedData?.companylogo ? (
                      <div className="logo-container">
                        <img
                          src={savedData.companylogo}
                          alt="Company Logo"
                          className="fixed-size-logo"
                          style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            padding: "10px",
                            backgroundColor: "#fff",
                          }}
                        />
                      </div>
                    ) : (
                      <div className="no-image">No logo uploaded</div>
                    )}
                  </div>
                </Col>
                <Col span={24} lg={16}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: "10px" }}>Terms & Conditions</h4>
                    <div className="terms-content">
                      {savedData?.termsandconditions
                        ?.split("\n")
                        .map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      {isLoadingSettings ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : isViewMode ? (
        <ViewPage />
      ) : (
        <>
          <div className="nav-container">
            <div className="nav-breadcrumb">
              <Link to="/" className="nav-link">
                <HomeOutlined /> Home
              </Link>
              <span className="separator">/</span>
              <Link to="/settings" className="nav-link">
                Settings
              </Link>
              <span className="separator">/</span>
              <span className="current">General</span>
            </div>
          </div>

          <div className="header-section">
            <div className="header-content">
              <div className="header-info">
                <h1>General Settings</h1>
                <p>
                  Manage your organization's general configuration and branding
                </p>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="content-grid">
              {/* Company Info Card */}
              <Card className="settings-card company-info">
                <div className="card-header">
                  <BuildOutlined className="section-icon" />
                  <Title level={5}>Company Information</Title>
                </div>
                <Form form={form} layout="vertical" className="settings-form">
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Company Name"
                        name="companyName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter company name",
                          },
                        ]}
                      >
                        <Input placeholder="Enter your company name" />
                      </Form.Item>
                    </Col>
                    {/* <Col xs={24} md={12}>
                      <Form.Item
                        label="Site Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter site title' }]}
                      >
                        <Input placeholder="Enter your site title" />
                      </Form.Item>
                    </Col> */}
                  </Row>
                </Form>
              </Card>

              {/* Brand Assets Card */}
              <Card className="settings-card brand-assets">
                <div className="card-header">
                  <GlobalOutlined className="section-icon" />
                  <Title level={5}>Brand Assets</Title>
                </div>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="upload-section">
                      <div style={{ marginBottom: "8px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 500,
                            color: "#1f2937",
                          }}
                        >
                          Company Logo
                        </label>
                        <div>
                          <Form.Item
                            // label="Company Logo"
                            name="file"
                            className="full-width"
                          >
                            <Upload.Dragger
                              name="file"
                              multiple={false}
                              beforeUpload={(file) => {
                                handleFileChange({ file }, "logo");
                                return false;
                              }}
                              maxCount={1}
                              accept=".png,.jpg,.jpeg"
                              fileList={
                                selectedLogo
                                  ? [
                                      {
                                        uid: "-1",
                                        name: selectedLogo.name,
                                        status: "done",
                                        url: URL.createObjectURL(selectedLogo),
                                      },
                                    ]
                                  : savedData?.companylogo
                                  ? [
                                      {
                                        uid: "-1",
                                        name: savedData.companylogo
                                          .split("/")
                                          .pop(),
                                        status: "done",
                                        url: savedData.companylogo,
                                      },
                                    ]
                                  : []
                              }
                            >
                              <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined
                                  style={{ fontSize: "24px", color: "#1890ff" }}
                                />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag file to upload logo
                              </p>
                              <p className="ant-upload-hint">
                                Support for PNG, JPG, JPEG files up to 2MB
                              </p>
                            </Upload.Dragger>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </Col>
                  {/* <Col xs={24} md={12}>
                    <div className="upload-section">
                    <label style={{ 
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 500,
                          color: '#1f2937'
                        }}>
                          Favicon
                        </label>
                      <Form.Item
                        name="favicon"
                        rules={[{ required: true, message: 'Please upload favicon' }]}
                      >
                        <Upload.Dragger 
                          {...uploadProps} 
                          className="upload-area"
                          beforeUpload={(file) => {
                            handleFileChange({ file }, 'favicon');
                            return false;
                          }}
                        >
                          <div className="upload-content">
                            <CloudUploadOutlined className="upload-icon" />
                            <p className="upload-title">Upload Favicon</p>
                            <p className="upload-hint">ICO, PNG up to 1MB</p>
                          </div>
                        </Upload.Dragger>
                      </Form.Item>
                    </div>
                  </Col> */}
                </Row>
              </Card>

              {/* Payment Information Card */}
              <Card className="settings-card payment-info">
                <div className="card-header">
                  <GlobalOutlined className="section-icon" />
                  <Title level={5}>Payment Information</Title>
                </div>
                <Form form={form} layout="vertical" className="settings-form">
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Merchant Name" name="merchant_name">
                        <Input placeholder="Enter merchant name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Merchant UPI ID" name="merchant_upi_id">
                        <Input placeholder="Enter merchant UPI ID" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Bank Name" name="bank_name">
                        <Input placeholder="Enter bank name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Account Holder Name"
                        name="account_holder_name"
                      >
                        <Input placeholder="Enter account holder name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Account Number" name="account_number">
                        <Input placeholder="Enter account number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="IFSC Code" name="ifsc_code">
                        <Input placeholder="Enter IFSC code" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Bank Branch" name="bank_branch">
                        <Input placeholder="Enter bank branch" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Terms Card */}
              <Card className="settings-card terms-section">
                <div className="card-header">
                  <UploadOutlined className="section-icon" />
                  <Title level={5}>Terms & Conditions</Title>
                </div>
                <div className="editor-container">
                  <Form.Item
                    name="termsandconditions"
                    className="terms-form-item"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Enter your terms and conditions here..."
                      className="terms-textarea"
                      value={termsContent}
                      onChange={(e) => {
                        setTermsContent(e.target.value);
                        form.setFieldsValue({
                          termsandconditions: e.target.value,
                        });
                      }}
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Save Button Section */}
              <div className="save-button-section">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  className="save-button"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        title={null}
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal"
        style={{
          "--antd-arrow-background-color": "#ffffff",
        }}
        styles={{
          body: {
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <div
          className="modal-header"
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            padding: "24px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <Button
            type="text"
            onClick={handleEditCancel}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <FiX style={{ fontSize: "20px" }} />
          </Button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditOutlined style={{ fontSize: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                Edit Settings
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update your general settings configuration
              </Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="settings-form"
          initialValues={savedData}
          style={{
            padding: "24px",
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="companyName"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Company Name
                  </span>
                }
              >
                <Input
                  placeholder="Enter company name"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="merchant_name"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Merchant Name
                  </span>
                }
              >
                <Input
                  placeholder="Enter merchant name"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="merchant_upi_id"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Merchant UPI ID
                  </span>
                }
              >
                <Input
                  placeholder="Enter merchant UPI ID"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="bank_name"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Bank Name
                  </span>
                }
              >
                <Input
                  placeholder="Enter bank name"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="account_holder_name"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Account Holder Name
                  </span>
                }
              >
                <Input
                  placeholder="Enter account holder name"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="account_number"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Account Number
                  </span>
                }
              >
                <Input
                  placeholder="Enter account number"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="ifsc_code"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    IFSC Code
                  </span>
                }
              >
                <Input
                  placeholder="Enter IFSC code"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="bank_branch"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Bank Branch
                  </span>
                }
              >
                <Input
                  placeholder="Enter bank branch"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <Form.Item
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Company Logo
                  </span>
                }
                name="file"
                className="full-width"
              >
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  beforeUpload={(file) => {
                    handleFileChange({ file }, "logo");
                    return false;
                  }}
                  maxCount={1}
                  accept=".png,.jpg,.jpeg"
                  fileList={
                    selectedLogo
                      ? [
                          {
                            uid: "-1",
                            name: selectedLogo.name,
                            status: "done",
                            url: URL.createObjectURL(selectedLogo),
                          },
                        ]
                      : savedData?.companylogo
                      ? [
                          {
                            uid: "-1",
                            name: savedData.companylogo.split("/").pop(),
                            status: "done",
                            url: savedData.companylogo,
                          },
                        ]
                      : []
                  }
                >
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to upload logo
                  </p>
                  <p className="ant-upload-hint">
                    Support for PNG, JPG, JPEG files up to 2MB
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item
                name="termsandconditions"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Terms and Conditions
                  </span>
                }
              >
                <TextArea
                  rows={4}
                  placeholder="Enter terms and conditions"
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            className="form-actions"
            style={{ marginBottom: 0, marginTop: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                onClick={handleEditCancel}
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "6px 20px",
                  height: "40px",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleEditSubmit}
                loading={loading}
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "6px 20px",
                  height: "40px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                }}
              >
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GeneralSettings;
