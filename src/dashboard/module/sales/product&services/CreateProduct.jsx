import React, { useState } from "react";
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

const CreateProduct = ({ visible, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const currentUser = useSelector(selectCurrentUser);
  const [createProduct] = useCreateProductMutation();
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);

  // Filter categories from the response
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

  const handleCurrencyChange = (value) => {
    const currency = currenciesData?.find(c => c.id === value);
    setSelectedCurrency(currency?.currencyIcon || '₹');
    form.setFieldsValue({ currency: value });
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("buying_price", values.buying_price);
      formData.append("selling_price", values.selling_price);
      formData.append("currency", values.currency || "");
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

      // Append image if exists
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
      className="custom-modal"
    >
      <div className="modal-header">
        <Button type="text" onClick={handleCancel} className="close-button">
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div className="header-content">
          <div className="header-icon">
            <FiBox style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2>Create New Product</h2>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>Fill in the information to create product</Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="product-form"
      >
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <span>
                    <FiBox style={{ color: '#9CA3AF' }} /> Product Name
                  </span>
                }
                rules={[{ required: true, message: "Please enter product name" }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label={
                  <span>
                    <FiTag style={{ marginRight: "8px" }} />
                    Category
                  </span>
                }
                rules={[{ required: true, message: "Please select a category" }]}
              >
                <div className="combined-input-item">
                  <Select 
                    placeholder="Select category"
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      form.setFieldsValue({ category: value });
                    }}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button
                          type="text"
                          icon={<FiPlus />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCategory();
                          }}
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          Add Category
                        </Button>
                      </>
                    )}
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: category.color || '#1890ff' 
                            }} 
                          />
                          {category.name}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="sku"
                label={
                  <span>
                    <FiHash style={{ color: '#9CA3AF' }} /> SKU
                  </span>
                }
              >
                <Input placeholder="Enter SKU" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hsn_sac"
                label={
                  <span>
                    <FiFileText style={{ color: '#9CA3AF' }} /> HSN/SAC Code
                  </span>
                }
              >
                <Input placeholder="Enter HSN/SAC code" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Pricing Section */}
        <div className="form-section">
          <h3 className="section-title">Pricing Details</h3>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="buying_price"
                label={
                  <span>
                    <FiDollarSign style={{ color: '#9CA3AF' }} /> Buying Price
                  </span>
                }
                rules={[{ required: true, message: "Please enter buying price" }]}
              >
                <div className="combined-input-item">
                  <div className="value-input-group">
                    <Select
                      onChange={handleCurrencyChange}
                      defaultValue={currenciesData?.[0]?.id}
                      style={{ width: '30%' }}
                    >
                      {currenciesData?.map((currency) => (
                        <Option key={currency.id} value={currency.id}>
                          {currency.currencyIcon}
                        </Option> 
                      ))}
                    </Select>
                    <InputNumber
                      style={{ width: '70%' }}
                      placeholder="Enter buying price"
                      min={0}
                      precision={2}
                    />
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="selling_price"
                label={
                  <span>
                    <FiDollarSign style={{ color: '#9CA3AF' }} /> Selling Price
                  </span>
                }
                rules={[{ required: true, message: "Please enter selling price" }]}
              >
                <div className="combined-input-item">
                  <div className="value-input-group">
                    <Select
                      value={form.getFieldValue('currency')}
                      style={{ width: '30%' }}
                      disabled
                    >
                      <Option value={form.getFieldValue('currency')}>
                        {selectedCurrency}
                      </Option>
                    </Select>
                    <InputNumber
                      style={{ width: '70%' }}
                      placeholder="Enter selling price"
                      min={0}
                      precision={2}
                    />
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Stock Management Section */}
        <div className="form-section">
          <h3 className="section-title">Stock Management</h3>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name="stock_status"
                label={
                  <span>
                    <FiPackage style={{ color: '#9CA3AF' }} /> Stock Status
                  </span>
                }
                className="stock-status-select"
              >
                <Select
                  placeholder="Select status"
                  className="custom-status-select"
                  dropdownClassName="stock-status-dropdown"
                >
                  {stockStatusOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      <div className="stock-status-option">
                        <span className="status-icon">{option.icon}</span>
                        <div className="status-content">
                          <span className="status-label" style={{ color: option.color }}>
                            {option.label}
                          </span>
                          <span className="status-description">{option.description}</span>
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="stock_quantity"
                label={
                  <span>
                    <FiPackage style={{ color: '#9CA3AF' }} /> Stock Quantity
                  </span>
                }
                rules={[{ required: true, message: "Please enter stock quantity" }]}
                className="stock-input"
              >
                <InputNumber
                  placeholder="Enter quantity"
                  min={0}
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="min_stock_level"
                label={
                  <span>
                    <FiAlertCircle style={{ color: '#9CA3AF' }} /> Min Stock
                  </span>
                }
                rules={[{ required: true, message: "Please enter minimum stock level" }]}
                className="stock-input"
              >
                <InputNumber
                  placeholder="Min level"
                  min={0}
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="max_stock_level"
                label={
                  <span>
                    <FiTrendingUp style={{ color: '#9CA3AF' }} /> Max Stock
                  </span>
                }
                className="stock-input"
              >
                <InputNumber
                  placeholder="Max level"
                  min={0}
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
            <Form.Item
                name="reorder_quantity"
                label={
                  <span>
                    <FiTrendingUp style={{ color: '#9CA3AF' }} /> Reorder Quantity
                  </span>
                }
                className="stock-input"
              >
                <InputNumber
                  placeholder="Reorder Quantity"
                  min={0}
                  className="full-width"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          <Form.Item
            name="description"
            label={
              <span>
                <FiFileText style={{ color: '#9CA3AF' }} /> Description
              </span>
            }
          >
            <TextArea
              placeholder="Enter product description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label={
              <span>
                <FiUpload style={{ color: '#9CA3AF' }} /> Product Image
              </span>
            }
          >
            <Upload {...uploadProps}>
              <Button icon={<FiUpload />} className="upload-button">
                Click to upload
              </Button>
            </Upload>
          </Form.Item>
        </div>

        <Divider />

        <div className="form-actions">
          <Button onClick={handleCancel} className="cancel-button">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
            Create Product
          </Button>
        </div>
      </Form>

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={addCategoryVisible}
        onCancel={() => setAddCategoryVisible(false)}
      />
    </Modal>
  );
};

export default CreateProduct;
