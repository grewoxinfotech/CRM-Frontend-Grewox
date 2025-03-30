import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  Upload,
  message,
  Spin,
  DatePicker,
} from "antd";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiBriefcase,
  FiHash,
  FiDollarSign,
  FiMapPin,
  FiChevronDown,
  FiUsers,
  FiUserPlus,
  FiCalendar,
} from "react-icons/fi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useCreateDealMutation } from "./services/dealApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { PlusOutlined } from '@ant-design/icons';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import './Deal.scss';
import { useGetSourcesQuery,useGetLabelsQuery } from '../crmsystem/souce/services/SourceApi';


import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../../sales/product&services/services/productApi";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultCurrency: inrCurrency?.currencyCode || 'INR',
    defaultPhoneCode: indiaCountry?.phoneCode?.replace('+', '') || '91'
  };
};

const CreateDeal = ({ open, onCancel, leadData, pipelines, dealStages }) => {
  const loggedInUser = useSelector(selectCurrentUser);
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const selectRef = useRef(null);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const [manualValue, setManualValue] = useState(0);
  const [selectedProductPrices, setSelectedProductPrices] = useState({});

  const [createDeal, { isLoading }] = useCreateDealMutation();
  
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
 const { data:labelsData } = useGetLabelsQuery(loggedInUser?.id);
 const { data: productsData } = useGetProductsQuery();

 const sources = sourcesData?.data || [];
 const labels = labelsData?.data || [];
 const products = productsData?.data || [];

 const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100
  });
  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  // Add state to track selected pipeline
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  // Filter stages based on selected pipeline
  const filteredStages = dealStages.filter(
    stage => stage.stageType === "deal" && stage.pipeline === selectedPipeline
  );

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    // Clear stage selection when pipeline changes
    form.setFieldValue('stage', undefined);
  };

  // Handle manual value change
  const handleValueChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setManualValue(numValue);
    
    // Calculate total product prices
    const productPricesTotal = Object.values(selectedProductPrices).reduce((sum, price) => sum + price, 0);
    
    // Set form value to manual value plus product prices
    form.setFieldsValue({ value: numValue + productPricesTotal });
  };

  // Handle products selection change
  const handleProductsChange = (selectedProductIds) => {
    const newSelectedPrices = {};
    
    // Calculate prices for selected products
    selectedProductIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        newSelectedPrices[productId] = product.price || 0;
      }
    });

    // Update selected product prices
    setSelectedProductPrices(newSelectedPrices);

    // Calculate total of selected product prices
    const productPricesTotal = Object.values(newSelectedPrices).reduce((sum, price) => sum + price, 0);

    // Update form value with manual value plus product prices
    form.setFieldsValue({ value: manualValue + productPricesTotal });
  };

  // Pre-fill form with lead data when available
  useEffect(() => {
    if (leadData && open) {
      form.setFieldsValue({
        leadTitle: `Deal from ${leadData.name}`,
        dealName: `${leadData.name}'s Deal`,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        source: leadData.source,
        leadId: leadData.id,
      });
    }
  }, [leadData, form, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    try {
      // Format phone number with country code
      const formattedPhone = values.phone ?
        `+${values.phoneCode} ${values.phone}` :
        null;
        
      const dealData = {
        firstName: values.firstName,
        email: values.email,
        phone: formattedPhone,
        dealName: values.dealName,
        pipeline: values.pipeline,
        status: values.status,
        stage: values.stage,
        label: values.label,
        value: parseFloat(values.value) || 0,
        currency: values.currency,
        closedDate: values.closedDate ? new Date(values.closedDate).toISOString() : null,
        company_name: values.company_name,
        source: values.source,
        products: { products: values.products || [] },
      };

      await createDeal(dealData).unwrap();
      message.success("Deal created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Failed to create deal: " + (error.data?.message || "Unknown error"));
      console.error("Create Deal Error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Add these consistent styles from CreateLead
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500"
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease"
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px"
  };

  const selectStyle = {
    width: '100%',
    height: '48px'
  };

  // Add multiSelectStyle for multiple select components
  const multiSelectStyle = {
    ...selectStyle,
    '& .ant-select-selector': {
      minHeight: '48px !important',
      height: 'auto !important',
      padding: '4px 12px !important',
      backgroundColor: '#f8fafc !important',
      border: '1px solid #e6e8eb !important',
      borderRadius: '10px !important',
    },
    '& .ant-select-selection-item': {
      height: '32px',
      lineHeight: '30px !important',
      borderRadius: '6px',
      background: '#E5E7EB',
      border: 'none',
      margin: '4px',
    }
  };

  return (
    <>
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal deal-form-modal"
      maskClosable={false}
      style={{
        "--antd-arrow-background-color": "#ffffff",
      }}
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
        content: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
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
          icon={<FiX />}
          onClick={handleCancel}
          style={{
            color: "#ffffff",
            position: "absolute",
            right: "24px",
            top: "24px",
          }}
        />
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
            <FiDollarSign style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Deal
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create deal
            </Text>
          </div>
        </div>
      </div>

      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="deal-form custom-form"
          style={{ padding: "24px" }}
        >
          {/* Deal Details Section */}
          <div className="section-title" style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Deal Details</Text>
          </div>
          
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <Form.Item
              name="dealName"
              label={<span style={formItemStyle}>Deal Name</span>}
              rules={[
                { required: true, message: "Please enter deal name" },
                { min: 3, message: "Deal name must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={<FiUser style={prefixIconStyle} />}
                placeholder="Enter deal name"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="valueGroup"
              label={<span style={formItemStyle}>Deal Value</span>}
              className="combined-input-item"
            >
              <Input.Group compact className="value-input-group">
                <Form.Item
                  name="currency"
                  noStyle
                  initialValue={defaultCurrency}
                >
                  <Select
                    style={{ width: '120px' }}
                    className="currency-select"
                    dropdownMatchSelectWidth={false}
                    suffixIcon={<FiChevronDown size={14} />}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const currencyData = currencies.find(c => c.currencyCode === option.value);
                      return (
                        currencyData?.currencyName?.toLowerCase().includes(input.toLowerCase()) ||
                        currencyData?.currencyCode?.toLowerCase().includes(input.toLowerCase())
                      );
                    }}
                    dropdownStyle={{ minWidth: '180px' }}
                    popupClassName="custom-select-dropdown"
                  >
                    {currencies?.map((currency) => (
                      <Option key={currency.id} value={currency.currencyCode}>
                        <div className="currency-option">
                          <span className="currency-icon">{currency.currencyIcon}</span>
                          <div className="currency-details">
                            <span className="currency-code">{currency.currencyCode}</span>
                            <span className="currency-name">{currency.currencyName}</span>
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="value"
                  noStyle
                >
                  <Input
                    style={{ width: 'calc(100% - 120px)' }}
                    placeholder="Enter amount"
                    type="number"
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="pipeline"
              label={<span style={formItemStyle}>Pipeline</span>}
              rules={[{ required: true, message: "Please select a pipeline" }]}
            >
              <Select
                ref={selectRef}
                open={dropdownOpen}
                onDropdownVisibleChange={setDropdownOpen}
                placeholder="Select pipeline"
                onChange={handlePipelineChange}
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
                dropdownRender={(menu) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddPipelineClick}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                          border: 'none',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                          fontWeight: '500',
                        }}
                      >
                        Add Pipeline
                      </Button>
                    </div>
                  </div>
                )}
                popupClassName="custom-select-dropdown"
              >
                {pipelines.map((pipeline) => (
                  <Option key={pipeline.id} value={pipeline.id}>
                    {pipeline.pipeline_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="stage"
              label={<span style={formItemStyle}>Stage</span>}
              rules={[{ required: true, message: "Please select a stage" }]}
            >
              <Select
                placeholder={selectedPipeline ? "Select stage" : "Select pipeline first"}
                disabled={!selectedPipeline}
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
                popupClassName="custom-select-dropdown"
              >
                {filteredStages.map((stage) => (
                  <Option key={stage.id} value={stage.id}>
                    {stage.stageName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={<span style={formItemStyle}>Status</span>}
            >
              <Select
                placeholder="Select status"
                style={selectStyle}
                popupClassName="custom-select-dropdown"
              >
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="won">Won</Option>
                <Option value="lost">Lost</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="closedDate"
              label={<span style={formItemStyle}>Expected Close Date</span>}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{
                  width: '100%',
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
                placeholder="Select date"
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
                superNextIcon={null}
                superPrevIcon={null}
              />
            </Form.Item>

            <Form.Item
              name="label"
              label={<span style={formItemStyle}>Label</span>}
            >
              <Select
                placeholder="Select label"
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
                popupClassName="custom-select-dropdown"
              >
                {labels.map(label => (
                  <Option key={label.id} value={label.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div  style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: label.color || '#1890ff'
                      }}></div>
                      {label.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
            name="source"
            label={<span style={formItemStyle}>Source</span>}
            rules={[{ required: true, message: "Please select source" }]}
          >
            <Select
              placeholder="Select source"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {sources.map((source) => (
                <Option key={source.id} value={source.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: source.color || '#1890ff'
                      }}
                    />
                    {source.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="products"
            label={<Text style={formItemStyle}>Products</Text>}
            rules={[{ required: false, message: 'Please select products' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              style={selectStyle}
              optionFilterProp="children"
              showSearch
              onChange={handleProductsChange}
            >
              {products?.map((product) => (
                <Option key={product.id} value={product.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>{product.name}</span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>₹{product.price}</span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          </div>

          {/* Contact Information Section */}
          <div className="section-title" style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Contact Information</Text>
          </div>
          
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <Form.Item
              name="firstName"
              label={<span style={formItemStyle}>First Name</span>}
            >
              <Input
                prefix={<FiUser style={prefixIconStyle} />}
                placeholder="Enter first name"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="company_name"
              label={<span style={formItemStyle}>Company Name</span>}
            >
              <Input
                prefix={<FiBriefcase style={prefixIconStyle} />}
                placeholder="Enter company name"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={formItemStyle}>Email</span>}
            >
              <Input
                prefix={<FiMail style={prefixIconStyle} />}
                placeholder="Enter email"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="phoneGroup"
              label={<span style={formItemStyle}>Phone Number</span>}
              className="combined-input-item"
            >
              <Input.Group compact className="phone-input-group">
                <Form.Item
                  name="phoneCode"
                  noStyle
                  initialValue={defaultPhoneCode}
                >
                  <Select
                    style={{ width: '120px' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    optionFilterProp="children"
                    className="phone-code-select"
                    suffixIcon={<FiChevronDown size={14} />}
                    filterOption={(input, option) => {
                      const countryData = countries.find(c => c.phoneCode.replace('+', '') === option.value);
                      return (
                        countryData?.countryName?.toLowerCase().includes(input.toLowerCase()) ||
                        countryData?.countryCode?.toLowerCase().includes(input.toLowerCase()) ||
                        countryData?.phoneCode?.includes(input)
                      );
                    }}
                    dropdownStyle={{ minWidth: '200px' }}
                    popupClassName="custom-select-dropdown"
                  >
                    {countries?.map((country) => (
                      <Option key={country.id} value={country.phoneCode.replace('+', '')}>
                        <div className="phone-code-option">
                          <div className="phone-code-main">
                            <span className="phone-code">+{country.phoneCode.replace('+', '')}</span>
                            <span className="country-code">{country.countryCode}</span>
                          </div>
                          <span className="country-name">{country.countryName}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="phone"
                  noStyle
                >
                  <Input
                    style={{ width: 'calc(100% - 120px)' }}
                    placeholder="Enter phone number"
                    prefix={<FiPhone style={{ color: "#1890ff", fontSize: "16px" }} />}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <Button
              onClick={handleCancel}
              size="large"
              style={{
                padding: "8px 24px",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid #e6e8eb",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{
                padding: "8px 24px",
                height: "44px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Create Deal
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
    
    <AddPipelineModal
      isOpen={isAddPipelineVisible}
      onClose={() => setIsAddPipelineVisible(false)}
    />

    <style jsx global>{`
      .deal-form-modal {
        .currency-select, .phone-code-select {
          cursor: pointer;
          .ant-select-selector {
            padding: 8px 8px !important;
            height: 48px !important;
          }
          
          .ant-select-selection-search {
            input {
              height: 100% !important;
            }
          }

          .ant-select-selection-item {
            padding-right: 20px !important;
            font-weight: 500 !important;
          }

          .ant-select-selection-placeholder {
            color: #9CA3AF !important;
          }
        }

        .currency-select .ant-select-selector {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
          border: none !important;
          
          .ant-select-selection-item {
            color: white !important;
          }
        }

        .ant-select-dropdown {
          padding: 8px !important;
          border-radius: 10px !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;

          .ant-select-item {
            padding: 8px 12px !important;
            border-radius: 6px !important;
            min-height: 32px !important;
            display: flex !important;
            align-items: center !important;
            color: #1f2937 !important;

            &-option-selected {
              background-color: #E6F4FF !important;
              font-weight: 500 !important;
              color: #1890ff !important;
            }

            &-option-active {
              background-color: #F3F4F6 !important;
            }
          }

          .ant-select-item-option-content {
            font-size: 14px !important;
          }

          .ant-select-item-empty {
            color: #9CA3AF !important;
          }
        }

        .value-input-group, .phone-input-group {
          display: flex !important;
          align-items: stretch !important;

          .ant-select {
            .ant-select-selector {
              height: 100% !important;
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
          }

          .ant-input {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
        }

        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
          background-color: #f8fafc !important;
          border: 1px solid #e6e8eb !important;
          border-radius: 10px !important;
          min-height: 48px !important;
          padding: 8px!important;
          display: flex !important;
          align-items: center !important;
        }

        .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .ant-select-single .ant-select-selector .ant-select-selection-item,
        .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
          line-height: 32px !important;
          height: 32px !important;
          transition: all 0.3s !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Add styles for multiple select (team members) */
        .ant-select-multiple {
          .ant-select-selector {
            min-height: 48px !important;
            height: auto !important;
            padding: 4px 8px !important;
            background-color: #f8fafc !important;
            border: 1px solid #e6e8eb !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: flex-start !important;
            flex-wrap: wrap !important;
          }

          .ant-select-selection-item {
            height: 32px !important;
            line-height: 30px !important;
            background: #f0f7ff !important;
            border: 1px solid #91caff !important;
            border-radius: 6px !important;
            color: #0958d9 !important;
            font-size: 13px !important;
            margin: 4px !important;
            padding: 0 8px !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-selection-search {
            margin: 4px !important;
          }

          .ant-select-selection-placeholder {
            padding: 8px !important;
          }
        }

        /* Team member option styling */
        .team-member-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          
          .member-name {
            font-weight: 500;
            color: #1f2937;
          }
          
          .member-role {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: capitalize;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .role-indicator {
          animation: pulse 2s infinite;
        }
      }
    `}</style>
    </>
  );
};

export default CreateDeal;
