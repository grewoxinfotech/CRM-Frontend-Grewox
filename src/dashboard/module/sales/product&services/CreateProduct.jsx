import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Upload,
  message,
  InputNumber,
  Divider,
} from "antd";
import {
  FiBox,
  FiTag,
  FiUpload,
  FiDollarSign,
  FiHash,
  FiFileText,
  FiX,
  FiPackage,
  FiAlertCircle,
  FiTrendingUp,
  FiPercent,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiType,
  FiInfo,
  FiPlus,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { useCreateProductMutation } from "./services/productApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import './product.scss';
import AddCategoryModal from "../../crm/crmsystem/category/AddCategoryModal";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateProduct = ({ visible, onClose, onSubmit, loading, currenciesData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const currentUser = useSelector(selectCurrentUser);
  const [createProduct] = useCreateProductMutation();
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);

  // Find default currency (INR)
  // const findIndianDefaults = (currencies) => {
  //   const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  //   return {
  //     defaultCurrency: inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK'
  //   };
  // };

  // const { defaultCurrency } = findIndianDefaults(currenciesData);

  const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

  const stockStatusOptions = [
    {
      value: 'in_stock',
      label: 'In Stock',
      icon: <FiCheckCircle style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      description: 'Product is available'
    },
    {
      value: 'low_stock',
      label: 'Low Stock', 
      icon: <FiAlertTriangle style={{ color: '#faad14' }} />,
      color: '#faad14',
      description: 'Stock is below minimum level'
    },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
      icon: <FiXCircle style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f',
      description: 'Product is not available'
    }
  ];

  // Update handleCurrencyChange
  const handleCurrencyChange = (value) => {
    const currency = currenciesData?.find(c => c.id === value);
    setSelectedCurrency(currency?.currencyIcon || '₹');
    form.setFieldsValue({ 
      currency: value  // Set the currency ID in form
    });
  };

  // Initialize form with default currency
  useEffect(() => {
    if (currenciesData) {
      const defaultCurr = currenciesData?.find(c => c.currencyCode === 'INR');
      if (defaultCurr) {
        form.setFieldsValue({
          currency: defaultCurr.id
        });
        setSelectedCurrency(defaultCurr.currencyIcon);
      }
    }
  }, [currenciesData, form]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Get selected currency or use default
      const currencyId = values.currency ;

      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("buying_price", values.buying_price);
      formData.append("selling_price", values.selling_price);
      formData.append("currency", currencyId); // Store currency ID
      formData.append("sku", values.sku || "");
      formData.append("tax", values.tax || "");
      formData.append("hsn_sac", values.hsn_sac || "");
      formData.append("description", values.description || "");
      formData.append("stock_quantity", values.stock_quantity || 0);
      formData.append("min_stock_level", values.min_stock_level || 0);
      formData.append("max_stock_level", values.max_stock_level || "");
      formData.append("reorder_quantity", values.reorder_quantity || "");
      formData.append("stock_status", values.stock_status || "in_stock");
      formData.append("created_by", currentUser?.username || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await onSubmit(formData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }
      return false;
    },
    onChange: ({ fileList }) => setFileList(fileList),
    fileList,
  };

  const handleAddCategory = () => {
    setAddCategoryVisible(true);
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
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
            <FiBox style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Product
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create product
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="lead-form custom-form"
        style={{ padding: "24px" }}
      >
        {/* Basic Information Section */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Basic Information</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="name"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Product Name</span>}
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input
              prefix={<FiBox style={{ color: '#9CA3AF' }} />}
              placeholder="Enter product name"
              style={{ height: '48px', borderRadius: '10px' }}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Category</span>}
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select category"
              style={{ width: '100%', height: '48px' }}
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
                      icon={<FiPlus />}
                      onClick={handleAddCategory}
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
                      Add Category
                    </Button>
                  </div>
                </div>
              )}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: category.color || '#1890ff'
                    }} />
                    {category.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Divider />

        {/* Pricing Details */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Pricing Details</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          // gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="buying_price"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Buying Price</span>}
            rules={[{ required: true, message: "Please enter buying price" }]}
          >
            <div className="price-input-group">
              <Form.Item
                name="currency"
                noStyle
              >
                <Select
                  onChange={handleCurrencyChange}
                  className="currency-select"
                  dropdownClassName="currency-dropdown"
                  // defaultValue={defaultCurrency} // Set default currency
                >
                  {currenciesData?.map((currency) => (
                    <Option 
                      key={currency.id} 
                      value={currency.id}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{currency.currencyIcon}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <InputNumber
                className="price-input"
                placeholder="Enter buying price"
                min={0}
                precision={2}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="selling_price"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Selling Price</span>}
            rules={[{ required: true, message: "Please enter selling price" }]}
          >
            <div className="price-input-group">
              <Select
                value={form.getFieldValue('currency')}
                className="currency-select"
                dropdownClassName="currency-dropdown"
                disabled
              >
                <Option value={form.getFieldValue('currency')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedCurrency}</span>
                  </div>
                </Option>
              </Select>
              <InputNumber
                className="price-input"
                placeholder="Enter selling price"
                min={0}
                precision={2}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="hsn_sac"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>HSN/SAC Code</span>}
          >
            <Input 
              placeholder="Enter HSN/SAC code"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="sku"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>SKU</span>}
          >
            <Input
              placeholder="Enter SKU"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Stock Management */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Stock Management</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="stock_status"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Stock Status</span>}
          >
            <Select 
              placeholder="Select status"
              className="stock-status-select"
              suffixIcon={<FiChevronDown />}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
            >
              {stockStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="stock_quantity"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Stock Quantity</span>
              </div>
            }
            rules={[{ required: true, message: "Please enter stock quantity" }]}
          >
            <InputNumber
              placeholder="Enter quantity"
              min={0}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
              prefix={<FiPackage style={{ color: '#6b7280', marginRight: '8px' }} />}
            />
          </Form.Item>

          <Form.Item
            name="min_stock_level"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Minimum Stock Level</span>}
          >
            <InputNumber
              placeholder="Enter minimum stock level"
              min={0}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
              prefix={<FiAlertCircle style={{ color: '#6b7280', marginRight: '8px' }} />}
            />
          </Form.Item>

          <Form.Item
            name="max_stock_level"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Maximum Stock Level</span>}
          >
            <InputNumber
              placeholder="Enter maximum stock level"
              min={0}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
              prefix={<FiTrendingUp style={{ color: '#6b7280', marginRight: '8px' }} />}
            />
          </Form.Item>

          <Form.Item
            name="reorder_quantity"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Reorder Quantity</span>}
          >
            <InputNumber
              placeholder="Enter reorder quantity"
              min={0}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
              prefix={<FiInfo style={{ color: '#6b7280', marginRight: '8px' }} />}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Additional Information */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Additional Information</Text>
        </div>
        <Form.Item
          name="description"
          label={<span style={{ color: '#374151', fontWeight: 500 }}>Description</span>}
        >
          <TextArea
            placeholder="Enter product description"
            rows={4}
            style={{ borderRadius: '10px' }}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={<span style={{ color: '#374151', fontWeight: 500 }}>Product Image</span>}
        >
          <Upload {...uploadProps}>
            <Button icon={<FiUpload />}>
              Click to upload
            </Button>
          </Upload>
        </Form.Item>

        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          marginTop: '24px'
        }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Product
          </Button>
        </div>
      </Form>

      <AddCategoryModal
        visible={addCategoryVisible}
        onCancel={() => setAddCategoryVisible(false)}
      />
    </Modal>
  );
};

export default CreateProduct;
