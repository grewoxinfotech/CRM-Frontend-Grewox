// import React, { useEffect, useState } from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   Button,
//   Typography,
//   Select,
//   Row,
//   Col,
//   Upload,
//   message,
//   InputNumber,
//   Divider,
// } from "antd";
// import {
//   FiBox,
//   FiTag,
//   FiUpload,
//   FiDollarSign,
//   FiHash,
//   FiFileText,
//   FiX,
//   FiPackage,
//   FiAlertCircle,
//   FiTrendingUp,
//   FiPercent,
//   FiCheckCircle,
//   FiAlertTriangle,
//   FiXCircle,
//   FiType,
//   FiInfo,
//   FiPlus,
//   FiUser,
//   FiChevronDown,
// } from "react-icons/fi";
// import { useUpdateProductMutation } from "./services/productApi";
// import { useSelector } from "react-redux";
// import { selectCurrentUser } from "../../../../auth/services/authSlice";
// import AddCategoryModal from "../../crm/crmsystem/category/AddCategoryModal";
// import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
// import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

// const { Text } = Typography;
// const { Option } = Select;
// const { TextArea } = Input;

// const EditProduct = ({ open, onCancel, initialValues, currenciesData }) => {
//   const [form] = Form.useForm();
//   const [fileList, setFileList] = useState([]);
//   const [updateProduct, { isLoading }] = useUpdateProductMutation();
//   const currentUser = useSelector(selectCurrentUser);
//   const [addCategoryVisible, setAddCategoryVisible] = useState(false);
//   const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);
//   const [selectedCurrency, setSelectedCurrency] = useState('₹');

//   const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

//   // const findIndianDefaults = (currencies) => {
//   //   const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
//   //   return {
//   //     defaultCurrency: inrCurrency?.id 
//   //   };
//   // };

//   // const { defaultCurrency } = findIndianDefaults(currenciesData);

//   const handleCurrencyChange = (value) => {
//     const currency = currenciesData?.find(c => c.id === value);
//     setSelectedCurrency(currency?.currencyIcon || '₹');
//     form.setFieldsValue({ currency: value });
//   };

//   useEffect(() => {
//     if (initialValues) {
//       const currency = currenciesData?.find(c => c.id === initialValues.currency);
//       setSelectedCurrency(currency?.currencyIcon || '₹');

//       form.setFieldsValue({
//         name: initialValues.name,
//         category: initialValues.category,
//         buying_price: Number(initialValues.buying_price) || 0,
//         selling_price: Number(initialValues.selling_price) || 0,
//         currency: initialValues.currency,
//         sku: initialValues.sku,
//         tax: initialValues.tax,
//         tax_name: initialValues.tax_name,
//         tax_percentage: initialValues.tax_percentage,
//         hsn_sac: initialValues.hsn_sac,
//         description: initialValues.description,
//         stock_quantity: initialValues.stock_quantity,
//         min_stock_level: initialValues.min_stock_level,
//         max_stock_level: initialValues.max_stock_level,
//         reorder_quantity: initialValues.reorder_quantity,
//         stock_status: initialValues.stock_status || 'in_stock',
//       });
//       if (initialValues.image) {
//         setFileList([
//           {
//             uid: "-1",
//             name: "Current Image",
//             status: "done",
//             url: initialValues.image,
//           },
//         ]);
//       }
//     }
//   }, [initialValues, form, currenciesData]);

//   const handleSubmit = async (values) => {
//     try {
//       console.log("🚀 ~ handleSubmit ~ Form Values:", values);
      
//       const formData = new FormData();
//       const currencyId = values.currency;

//       formData.append("name", values.name);
//       formData.append("category", values.category);
//       formData.append("buying_price", values.buying_price);
//       formData.append("selling_price", values.selling_price);
//       formData.append("currency", currencyId);
//       formData.append("sku", values.sku || "");
//       formData.append("tax", values.tax || "");
//       formData.append("tax_name", values.tax_name || "");
//       formData.append("tax_percentage", values.tax_percentage || 0);
//       formData.append("hsn_sac", values.hsn_sac || "");
//       formData.append("description", values.description || "");
//       formData.append("stock_quantity", values.stock_quantity || 0);
//       formData.append("min_stock_level", values.min_stock_level || 0);
//       formData.append("max_stock_level", values.max_stock_level || "");
//       formData.append("reorder_quantity", values.reorder_quantity || "");
//       formData.append("stock_status", values.stock_status || "in_stock");
//       formData.append("updated_by", currentUser?.username || "");

//       if (fileList.length > 0 && fileList[0].originFileObj) {
//         formData.append("image", fileList[0].originFileObj);
//       }

//       // Log FormData entries
//       console.log("🚀 ~ handleSubmit ~ FormData entries:");
//       for (let pair of formData.entries()) {
//         console.log(pair[0] + ': ' + pair[1]);
//       }

//       const response = await updateProduct({ id: initialValues.id, data: formData }).unwrap();
//       console.log("🚀 ~ handleSubmit ~ API Response:", response);

//       message.success("Product updated successfully");
//       form.resetFields();
//       setFileList([]);
//       onCancel();
//     } catch (error) {
//       console.error("🚀 ~ handleSubmit ~ Error:", error);
//       message.error(error?.data?.message || "Failed to update product");
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     setFileList([]);
//     onCancel();
//   };

//   const uploadProps = {
//     beforeUpload: (file) => {
//       const isImage = file.type.startsWith("image/");
//       if (!isImage) {
//         message.error("You can only upload image files!");
//         return false;
//       }
//       const isLt2M = file.size / 1024 / 1024 < 2;
//       if (!isLt2M) {
//         message.error("Image must be smaller than 2MB!");
//         return false;
//       }
//       return false;
//     },
//     onChange: ({ fileList }) => setFileList(fileList),
//     fileList,
//   };

//   // Add validation rules for stock quantities
//   const validateStockQuantities = {
//     max_stock_level: [
//       { required: true, message: "Please enter maximum stock level" },
//       ({ getFieldValue }) => ({
//         validator(_, value) {
//           const stockQuantity = getFieldValue("stock_quantity");
//           if (!value || !stockQuantity || value >= stockQuantity) {
//             return Promise.resolve();
//           }
//           return Promise.reject(
//             new Error(
//               "Maximum stock level must be greater than current stock quantity"
//             )
//           );
//         },
//       }),
//     ],
//     stock_quantity: [
//       { required: true, message: "Please enter stock quantity" },
//       ({ getFieldValue }) => ({
//         validator(_, value) {
//           const maxStock = getFieldValue("max_stock_level");
//           const minStock = getFieldValue("min_stock_level");

//           if (maxStock && value > maxStock) {
//             return Promise.reject(
//               new Error("Stock quantity cannot exceed maximum stock level")
//             );
//           }
//           if (minStock && value < minStock) {
//             return Promise.reject(
//               new Error(
//                 "Stock quantity cannot be less than minimum stock level"
//               )
//             );
//           }
//           return Promise.resolve();
//         },
//       }),
//     ],
//     min_stock_level: [
//       { required: true, message: "Please enter minimum stock level" },
//       // { max: 20, message: "Minimum stock level cannot be more than 20" },
//       ({ getFieldValue }) => ({
//         validator(_, value) {
//           if (!value) return Promise.resolve();

//           const stockQuantity = getFieldValue("stock_quantity");
//           const reorderQuantity = getFieldValue("reorder_quantity");

//           if (value > stockQuantity) {
//             return Promise.reject(
//               new Error(
//                 "Minimum stock level cannot be greater than current stock quantity"
//               )
//             );
//           }
//           if (reorderQuantity && value < reorderQuantity) {
//             return Promise.reject(
//               new Error(
//                 "Minimum stock level must be greater than reorder quantity"
//               )
//             );
//           }
//           return Promise.resolve();
//         },
//       }),
//     ],
//     reorder_quantity: [
//       { required: true, message: "Please enter reorder quantity" },
//       // { max: 20, message: "Reorder quantity cannot be more than 20" },
//       ({ getFieldValue }) => ({
//         validator(_, value) {
//           if (!value) return Promise.resolve();

//           const minStock = getFieldValue("min_stock_level");
//           if (minStock && value > minStock) {
//             return Promise.reject(
//               new Error(
//                 "Reorder quantity must be less than minimum stock level"
//               )
//             );
//           }
//           return Promise.resolve();
//         },
//       }),
//     ],
//   };

//   const stockStatusOptions = [
//     {
//       value: 'in_stock',
//       label: 'In Stock',
//       icon: <FiCheckCircle style={{ color: '#52c41a' }} />,
//       color: '#52c41a',
//       description: 'Product is available'
//     },
//     {
//       value: 'low_stock',
//       label: 'Low Stock',
//       icon: <FiAlertTriangle style={{ color: '#faad14' }} />,
//       color: '#faad14',
//       description: 'Stock is below minimum level'
//     },
//     {
//       value: 'out_of_stock',
//       label: 'Out of Stock',
//       icon: <FiXCircle style={{ color: '#ff4d4f' }} />,
//       color: '#ff4d4f',
//       description: 'Product is not available'
//     }
//   ];

//   const handleAddCategory = () => {
//     setAddCategoryVisible(true);
//   };

//   const handleBuyingPriceChange = (value) => {
//     form.setFieldsValue({ buying_price: value });
//     form.validateFields(['selling_price']);
//   };

//   const handleSellingPriceChange = (value) => {
//     form.setFieldsValue({ selling_price: value });
//     if (form.getFieldValue('buying_price')) {
//       form.validateFields(['selling_price']);
//     }
//   };

//   return (
//     <Modal
//       title={null}
//       open={open}
//       onCancel={handleCancel}
//       footer={null}
//       width={800}
//       destroyOnClose={true}
//       centered
//       closeIcon={null}
//       className="pro-modal custom-modal"
//       styles={{
//         body: {
//           padding: 0,
//           borderRadius: "8px",
//           overflow: "hidden",
//         },
//       }}
//     >
//       <div
//         className="modal-header"
//         style={{
//           background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
//           padding: "24px",
//           color: "#ffffff",
//           position: "relative",
//         }}
//       >
//         <Button
//           type="text"
//           onClick={onCancel}
//           style={{
//             position: "absolute",
//             top: "16px",
//             right: "16px",
//             color: "#ffffff",
//             width: "32px",
//             height: "32px",
//             padding: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(255, 255, 255, 0.2)",
//             borderRadius: "8px",
//             border: "none",
//             cursor: "pointer",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
//           }}
//         >
//           <FiX style={{ fontSize: "20px" }} />
//         </Button>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//           }}
//         >
//           <div
//             style={{
//               width: "48px",
//               height: "48px",
//               borderRadius: "12px",
//               background: "rgba(255, 255, 255, 0.2)",
//               backdropFilter: "blur(8px)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <FiBox style={{ fontSize: "24px", color: "#ffffff" }} />
//           </div>
//           <div>
//             <h2
//               style={{
//                 margin: "0",
//                 fontSize: "24px",
//                 fontWeight: "600",
//                 color: "#ffffff",
//               }}
//             >
//               Edit Product
//             </h2>
//             <Text
//               style={{
//                 fontSize: "14px",
//                 color: "rgba(255, 255, 255, 0.85)",
//               }}
//             >
//               Update the product information
//             </Text>
//           </div>
//         </div>
//       </div>

//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSubmit}
//         className="lead-form custom-form"
//         style={{ padding: "24px" }}
//       >
//         <Row gutter={24}>
//           <Col span={12}>
//             <Form.Item
//               name="name"
//               label={
//                 <span style={{ fontSize: "14px", fontWeight: "500" }}>
//                   Product Name
//                 </span>
//               }
//               rules={[ {
//                 validator: (_, value) => {
//                   if (!value) return Promise.resolve();
//                   if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
//                     return Promise.reject(
//                         new Error('Product name must contain both uppercase or lowercase English letters')
//                     );
//                   }
//                 }
//               }
//               ]}  
//             >
//               <Input
//                 prefix={
//                   <FiBox style={{ color: "#1890ff", fontSize: "16px" }} />
//                 }
//                 placeholder="Enter product name"
//                 size="large"
//                 style={{
//                   borderRadius: "10px",
//                   padding: "8px 16px",
//                   height: "48px",
//                   backgroundColor: "#f8fafc",
//                   border: "1px solid #e6e8eb",
//                 }}
//               />
//             </Form.Item>
//           </Col>
//           <Col span={12}>
//             <Form.Item
//               name="category"
//               label={<span style={{ color: '#374151', fontWeight: 500 }}>Category</span>}
//             >
//               <Select
//                 listHeight={100}
//                 dropdownStyle={{
//                   Height: '100px',
//                   overflowY: 'auto',
//                   scrollbarWidth: 'thin',
//                   scrollBehavior: 'smooth'
//                 }}
//                 placeholder="Select category"
//                 style={{ width: '100%', height: '48px' }}
//                 dropdownRender={(menu) => (
//                   <div onClick={(e) => e.stopPropagation()}>
//                     {menu}
//                     <Divider style={{ margin: '8px 0' }} />
//                     <div
//                       style={{
//                         padding: '8px 12px',
//                         display: 'flex',
//                         justifyContent: 'center'
//                       }}
//                     >
//                       <Button
//                         type="primary"
//                         icon={<FiPlus />}
//                         onClick={handleAddCategory}
//                         style={{
//                           width: '100%',
//                           background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
//                           border: 'none',
//                           height: '40px',
//                           borderRadius: '8px',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '8px',
//                           boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
//                           fontWeight: '500',
//                         }}
//                       >
//                         Add Category
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               >
//                 {categories.map((category) => (
//                   <Option key={category.id} value={category.id}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <div style={{
//                         width: '8px',
//                         height: '8px',
//                         borderRadius: '50%',
//                         backgroundColor: category.color || '#1890ff'
//                       }} />
//                       {category.name}
//                     </div>
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>
//         </Row>

//         <Divider />

//         <div className="form-grid" style={{
//           display: 'grid',
//           gap: '16px',
//           marginBottom: '32px'
//         }}>
//          <Form.Item
//             name="buying_price"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Buying Price</span>}
//             rules={[
//               { required: true, message: "Please enter buying price" },
//               {
//                 validator: (_, value) => {
//                   if (!value) return Promise.reject('Please enter buying price');
//                   if (value <= 0) {
//                     return Promise.reject('Buying price must be greater than 0');
//                   }
//                   return Promise.resolve();
//                 }
//               }
//             ]}
//           >
//             <div className="price-input-group" style={{
//               display: 'flex',
//               height: '48px',
//               backgroundColor: '#f8fafc',
//               borderRadius: '10px',
//               border: '1px solid #e6e8eb',
//               overflow: 'hidden',
//               marginBottom: 0
//             }}>
//               <Form.Item name="currency" noStyle>
//                 <div style={{
//                   width: "100px",
//                   height: "48px",
//                   background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
//                   color: "white",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "10px 0 0 10px",
//                   fontWeight: 500,
//                 }}>
//                   <span>{selectedCurrency?.currencyIcon || '₹'}</span>
//                   <span style={{ marginLeft: '4px' }}>{selectedCurrency?.currencyCode || 'INR'}</span>
//                 </div>
//               </Form.Item>
//               <Form.Item
//                 name="buying_price"
//                 noStyle
//               >
//                 <InputNumber
//                   placeholder="Enter buying price"
//                   size="large"
//                   style={{
//                     flex: 1,
//                     width: '100%',
//                     border: 'none',
//                     borderLeft: '1px solid #e6e8eb',
//                     borderRadius: 0,
//                     height: '48px',
//                     padding: '0 16px',
//                   }}
//                   min={1}
//                   precision={0}
//                   className="price-input"
//                   parser={value => {
//                     const parsedValue = parseInt(value);
//                     return isNaN(parsedValue) ? '' : parsedValue;
//                   }}
//                   onChange={handleBuyingPriceChange}
//                 />
//               </Form.Item>
//             </div>
//           </Form.Item>

//           <Form.Item
//             name="selling_price"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Selling Price</span>}
//             rules={[
//               { required: true, message: "Please enter selling price" },
//               {
//                 validator: (_, value) => {
//                   if (!value) return Promise.reject('Please enter selling price');
//                   if (value <= 0) {
//                     return Promise.reject('Selling price must be greater than 0');
//                   }
//                   const buyingPrice = form.getFieldValue('buying_price');
//                   if (!buyingPrice) return Promise.reject('Please enter buying price first');
//                   if (parseFloat(value) <= parseFloat(buyingPrice)) {
//                     return Promise.reject('Selling price must be greater than buying price');
//                   }
//                   return Promise.resolve();
//                 }
//               }
//             ]}
//           >
//             <div className="price-input-group" style={{
//               display: 'flex',
//               height: '48px',
//               backgroundColor: '#f8fafc',
//               borderRadius: '10px',
//               border: '1px solid #e6e8eb',
//               overflow: 'hidden',
//               marginBottom: 0
//             }}>
//               <Form.Item name="currency" noStyle>
//                 <div style={{
//                   width: "100px",
//                   height: "48px",
//                   background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
//                   color: "white",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "10px 0 0 10px",
//                   fontWeight: 500,
//                 }}>
//                   <span>{selectedCurrency?.currencyIcon || '₹'}</span>
//                   <span style={{ marginLeft: '4px' }}>{selectedCurrency?.currencyCode || 'INR'}</span>
//                 </div>
//               </Form.Item>
//               <Form.Item
//                 name="selling_price"
//                 noStyle
//               >
//                 <InputNumber
//                   placeholder="Enter selling price"
//                   size="large"
//                   style={{
//                     flex: 1,
//                     width: '100%',
//                     border: 'none',
//                     borderLeft: '1px solid #e6e8eb',
//                     borderRadius: 0,
//                     height: '48px',
//                     padding: '0 16px',
//                   }}
//                   min={1}
//                   precision={0}
//                   className="price-input"
//                   parser={value => {
//                     const parsedValue = parseInt(value);
//                     return isNaN(parsedValue) ? '' : parsedValue;
//                   }}
//                   onChange={handleSellingPriceChange}
//                 />
//               </Form.Item>
//             </div>
//           </Form.Item>

//           <Form.Item
//             name="sku"
//             label={
//               <span style={{ fontSize: "14px", fontWeight: "500" }}>SKU</span>
//             }
//           >
//             <Input
//               prefix={
//                 <FiTag style={{ color: "#1890ff", fontSize: "16px" }} />
//               }
//               placeholder="Enter SKU"
//               size="large"
//               style={{
//                 borderRadius: "10px",
//                 padding: "8px 16px",
//                 height: "48px",
//                 backgroundColor: "#f8fafc",
//                 border: "1px solid #e6e8eb",
//               }}
//             />
//           </Form.Item>

//           <Form.Item
//             name="hsn_sac"
//             label={
//               <span style={{ fontSize: "14px", fontWeight: "500" }}>
//                 HSN/SAC
//               </span>
//             }
//           >
//             <Input
//               prefix={
//                 <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
//               }
//               placeholder="Enter HSN/SAC code"
//               size="large"
//               style={{
//                 borderRadius: "10px",
//                 padding: "8px 16px",
//                 height: "48px",
//                 backgroundColor: "#f8fafc",
//                 border: "1px solid #e6e8eb",
//               }}
//             />
//           </Form.Item>

//           <Form.Item
//             name="tax_name"
//             label={
//               <span style={{ color: "#374151", fontWeight: 500 }}>
//                 Tax Name
//               </span>
//             }
//           >
//             <Input 
//               placeholder="Enter tax name (e.g. GST, VAT)" 
//               size="large"
//               style={{
//                 width: "100%",
//                 borderRadius: "10px",
//                 padding: "8px 16px",
//                 height: "48px",
//                 backgroundColor: "#f8fafc",
//                 border: "1px solid #e6e8eb"
//               }}
//             />
//           </Form.Item>
          
//           <Form.Item
//             name="tax_percentage"
//             label={
//               <span style={{ color: "#374151", fontWeight: 500 }}>
//                 Tax Percentage
//               </span>
//             }
//             rules={[
//               {
//                 validator: (_, value) => {
//                   if (value && value < 0) {
//                     return Promise.reject('Tax percentage cannot be negative');
//                   }
//                   return Promise.resolve();
//                 }
//               }
//             ]}
//           >
//             <InputNumber
//               placeholder="Enter tax percentage"
//               min={0}
//               max={100}
//               addonAfter="%"
//               style={{ 
//                 width: "100%",
//                 borderRadius: "10px",
//                 height: "48px",
//                 backgroundColor: "#f8fafc",
//                 border: "1px solid #e6e8eb",
//               }}
//             />
//           </Form.Item>
//         </div>

//         <Divider />

//         <div className="section-title" style={{ marginBottom: '16px' }}>
//           <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Stock Management</Text>
//         </div>
//         <div className="form-grid" style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(2, 1fr)',
//           gap: '24px',
//           marginBottom: '32px'
//         }}>
//           <Form.Item
//             name="stock_status"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Stock Status</span>}
//           >
//             <Select
//               placeholder="Select status"
//               className="stock-status-select"
//               suffixIcon={<FiChevronDown />}
//               style={{
//                 width: '100%',
//                 height: '48px',
//                 borderRadius: '10px',
//                 border: '1px solid #d1d5db',
//                 backgroundColor: '#f9fafb'
//               }}
//             >
//               {stockStatusOptions.map(option => (
//                 <Option key={option.value} value={option.value}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                     {option.icon}
//                     <span>{option.label}</span>
//                   </div>
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="stock_quantity"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Stock Quantity</span>}
//             rules={ validateStockQuantities.stock_quantity}
//           >
//             <InputNumber
//               placeholder="Enter quantity"
//               min={0}
//               style={{
//                 width: '100%',
//                 height: '48px',
//                 borderRadius: '10px',
//                 border: '1px solid #d1d5db',
//                 backgroundColor: '#f9fafb'
//               }}
//               prefix={<FiPackage style={{ color: '#6b7280', marginRight: '8px' }} />}
//             />
//           </Form.Item>

//           <Form.Item
//             name="min_stock_level"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Minimum Stock Level</span>}
//             rules={validateStockQuantities.min_stock_level}
//           >
//             <InputNumber
//               placeholder="Enter minimum stock level"
//               min={0}
//               style={{
//                 width: '100%',
//                 height: '48px',
//                 borderRadius: '10px',
//                 border: '1px solid #d1d5db',
//                 backgroundColor: '#f9fafb'
//               }}
//               prefix={<FiAlertCircle style={{ color: '#6b7280', marginRight: '8px' }} />}
//             />
//           </Form.Item>

//           <Form.Item
//             name="max_stock_level"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Maximum Stock Level</span>}
//             rules={validateStockQuantities.max_stock_level}
//           >
//             <InputNumber
//               placeholder="Enter maximum stock level"
//               min={0}
//               style={{
//                 width: '100%',
//                 height: '48px',
//                 borderRadius: '10px',
//                 border: '1px solid #d1d5db',
//                 backgroundColor: '#f9fafb'
//               }}
//               prefix={<FiTrendingUp style={{ color: '#6b7280', marginRight: '8px' }} />}
//             />
//           </Form.Item>

//           <Form.Item
//             name="reorder_quantity"
//             label={<span style={{ color: '#374151', fontWeight: 500 }}>Reorder Quantity</span>}
//             rules={validateStockQuantities.reorder_quantity}
//           >
//             <InputNumber
//               placeholder="Enter reorder quantity"
//               min={0}
//               style={{
//                 width: '100%',
//                 height: '48px',
//                 borderRadius: '10px',
//                 border: '1px solid #d1d5db',
//                 backgroundColor: '#f9fafb'
//               }}
//               prefix={<FiInfo style={{ color: '#6b7280', marginRight: '8px' }} />}
//             />
//           </Form.Item>
//         </div>

//         <Divider />

//         <div className="section-title" style={{ marginBottom: '16px' }}>
//           <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Additional Information</Text>
//         </div>
//         <Form.Item
//           name="description"
//           label={<span style={{ color: '#374151', fontWeight: 500 }}>Description</span>}
//           initialValue={initialValues?.description}
//         >
//           <TextArea
//             placeholder="Enter product description"
//             rows={4}
//             style={{ borderRadius: '10px' }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="image"
//           label={<span style={{ color: '#374151', fontWeight: 500 }}>Product Image</span>}
//         >
//           <Upload {...uploadProps}>
//             <Button icon={<FiUpload />}>
//               Click to upload
//             </Button>
//           </Upload>
//         </Form.Item>

//         <div style={{
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: '16px',
//           marginTop: '24px'
//         }}>
//           <Button onClick={handleCancel}>
//             Cancel
//           </Button>
//           <Button 
//             type="primary" 
//             htmlType="submit" 
//             loading={isLoading}
//             onClick={handleSubmit}
//           >
//             Update Product
//           </Button>
//         </div>
//       </Form>

//       <AddCategoryModal
//         visible={addCategoryVisible}
//         onCancel={() => setAddCategoryVisible(false)}
//       />
//     </Modal>
//   );
// };

// export default EditProduct;




import React, { useEffect, useState } from "react";
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
import { useUpdateProductMutation } from "./services/productApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import AddCategoryModal from "../../crm/crmsystem/category/AddCategoryModal";
import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditProduct = ({ open, onCancel, initialValues, currenciesData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const currentUser = useSelector(selectCurrentUser);
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');

  const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

  // const findIndianDefaults = (currencies) => {
  //   const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  //   return {
  //     defaultCurrency: inrCurrency?.id 
  //   };
  // };

  // const { defaultCurrency } = findIndianDefaults(currenciesData);

  const handleCurrencyChange = (value) => {
    const currency = currenciesData?.find(c => c.id === value);
    setSelectedCurrency(currency?.currencyIcon || '₹');
    form.setFieldsValue({ currency: value });
  };

  useEffect(() => {
    if (initialValues) {
      const currency = currenciesData?.find(c => c.id === initialValues.currency);
      setSelectedCurrency(currency?.currencyIcon || '₹');

      form.setFieldsValue({
        name: initialValues.name,
        category: initialValues.category,
        buying_price: Number(initialValues.buying_price) || 0,
        selling_price: Number(initialValues.selling_price) || 0,
        currency: initialValues.currency,
        tax_name: initialValues.tax_name,
        tax_percentage: initialValues.tax_percentage,
        sku: initialValues.sku,
        hsn_sac: initialValues.hsn_sac,
        description: initialValues.description,
        stock_quantity: initialValues.stock_quantity,
        min_stock_level: initialValues.min_stock_level,
        max_stock_level: initialValues.max_stock_level,
        reorder_quantity: initialValues.reorder_quantity,
        stock_status: initialValues.stock_status || 'in_stock',
      });
      if (initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "Current Image",
            status: "done",
            url: initialValues.image,
          },
        ]);
      }
    }
  }, [initialValues, form, currenciesData]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      const currencyId = values.currency ;

      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("buying_price", values.buying_price);
      formData.append("selling_price", values.selling_price);
      formData.append("currency", currencyId);
      formData.append("sku", values.sku || "");
      formData.append("tax_name", values.tax_name || "");
      formData.append("tax_percentage", values.tax_percentage || 0);
      formData.append("hsn_sac", values.hsn_sac || "");
      formData.append("description", values.description || "");
      formData.append("stock_quantity", values.stock_quantity || 0);
      formData.append("min_stock_level", values.min_stock_level || 0);
      formData.append("max_stock_level", values.max_stock_level || "");
      formData.append("reorder_quantity", values.reorder_quantity || "");
      formData.append("stock_status", values.stock_status || "in_stock");
      formData.append("updated_by", currentUser?.username || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await updateProduct({ id: initialValues.id, data: formData }).unwrap();
      message.success("Product updated successfully");
      form.resetFields();
      setFileList([]);
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update product");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
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

  // Add validation rules for stock quantities
  const validateStockQuantities = {
    max_stock_level: [
      { required: true, message: "Please enter maximum stock level" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const stockQuantity = getFieldValue("stock_quantity");
          if (!value || !stockQuantity || value >= stockQuantity) {
            return Promise.resolve();
          }
          return Promise.reject(
            new Error(
              "Maximum stock level must be greater than current stock quantity"
            )
          );
        },
      }),
    ],
    stock_quantity: [
      { required: true, message: "Please enter stock quantity" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          const maxStock = getFieldValue("max_stock_level");
          const minStock = getFieldValue("min_stock_level");

          if (maxStock && value > maxStock) {
            return Promise.reject(
              new Error("Stock quantity cannot exceed maximum stock level")
            );
          }
          if (minStock && value < minStock) {
            return Promise.reject(
              new Error(
                "Stock quantity cannot be less than minimum stock level"
              )
            );
          }
          return Promise.resolve();
        },
      }),
    ],
    min_stock_level: [
      { required: true, message: "Please enter minimum stock level" },
      // { max: 20, message: "Minimum stock level cannot be more than 20" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value) return Promise.resolve();

          const stockQuantity = getFieldValue("stock_quantity");
          const reorderQuantity = getFieldValue("reorder_quantity");

          if (value > stockQuantity) {
            return Promise.reject(
              new Error(
                "Minimum stock level cannot be greater than current stock quantity"
              )
            );
          }
          if (reorderQuantity && value < reorderQuantity) {
            return Promise.reject(
              new Error(
                "Minimum stock level must be greater than reorder quantity"
              )
            );
          }
          return Promise.resolve();
        },
      }),
    ],
    reorder_quantity: [
      { required: true, message: "Please enter reorder quantity" },
      // { max: 20, message: "Reorder quantity cannot be more than 20" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value) return Promise.resolve();

          const minStock = getFieldValue("min_stock_level");
          if (minStock && value > minStock) {
            return Promise.reject(
              new Error(
                "Reorder quantity must be less than minimum stock level"
              )
            );
          }
          return Promise.resolve();
        },
      }),
    ],
  };

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

  const handleAddCategory = () => {
    setAddCategoryVisible(true);
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
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
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={onCancel}
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
              Edit Product
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update the product information
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
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Product Name
                </span>
              }
              rules={[ {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                    return Promise.reject(
                        new Error('Product name must contain both uppercase or lowercase English letters')
                    );
                }
                return Promise.resolve();
                }
              }
              ]}  
            >
              <Input
                prefix={
                  <FiBox style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter product name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label={<span style={{ color: '#374151', fontWeight: 500 }}>Category</span>}
            >
              <Select
                listHeight={100}
                dropdownStyle={{
                  Height: '100px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollBehavior: 'smooth'
                }}
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
          </Col>
        </Row>

        <Divider />

        <div className="form-grid" style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '32px'
        }}>
         <Form.Item
            name="buying_price"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Buying Price</span>}
            rules={[
              {
                validator: (_, value) => {
                  if (value && value % 1 !== 0) {
                    return Promise.reject('Decimal values are not allowed in buying price');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <div className="price-input-group" style={{
              display: 'flex',
              height: '48px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e6e8eb',
              overflow: 'hidden',
              marginBottom: 0
            }}>
              <Form.Item name="currency" noStyle>
                <div style={{
                  width: "100px",
                  height: "48px",
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px 0 0 10px",
                  fontWeight: 500,
                }}>
                  <span>{selectedCurrency?.currencyIcon || '₹'}</span>
                  <span style={{ marginLeft: '4px' }}>{selectedCurrency?.currencyCode || 'INR'}</span>
                </div>
              </Form.Item>
              <Form.Item
                name="buying_price"
                noStyle
              >
                <InputNumber
                  placeholder="Enter buying price"
                  size="large"
                  style={{
                    flex: 1,
                    width: '100%',
                    border: 'none',
                    borderLeft: '1px solid #e6e8eb',
                    borderRadius: 0,
                    height: '48px',
                    padding: '0 16px',
                  }}
                  min={0}
                  precision={0}
                  className="price-input"
                  parser={value => {
                    const parsedValue = parseInt(value);
                    return isNaN(parsedValue) ? '' : parsedValue;
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="selling_price"
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Selling Price</span>}
            rules={[
             
              {
                validator: (_, value) => {
                  if (value && value % 1 !== 0) {
                    return Promise.reject('Decimal values are not allowed in selling price');
                  }
                  return Promise.resolve();
                }
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const buyingPrice = getFieldValue('buying_price');
                  if (!value || !buyingPrice || value >= buyingPrice) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Selling price cannot be lower than buying price')
                  );
                },
              }),
            ]}
          >
            <div className="price-input-group" style={{
              display: 'flex',
              height: '48px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e6e8eb',
              overflow: 'hidden',
              marginBottom: 0
            }}>
              <Form.Item name="currency" noStyle>
                <div style={{
                  width: "100px",
                  height: "48px",
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px 0 0 10px",
                  fontWeight: 500,
                }}>
                  <span>{selectedCurrency?.currencyIcon || '₹'}</span>
                  <span style={{ marginLeft: '4px' }}>{selectedCurrency?.currencyCode || 'INR'}</span>
                </div>
              </Form.Item>
              <Form.Item
                name="selling_price"
                noStyle
              >
                <InputNumber
                  placeholder="Enter selling price"
                  size="large"
                  style={{
                    flex: 1,
                    width: '100%',
                    border: 'none',
                    borderLeft: '1px solid #e6e8eb',
                    borderRadius: 0,
                    height: '48px',
                    padding: '0 16px',
                  }}
                  min={0}
                  precision={0}
                  className="price-input"
                  parser={value => {
                    const parsedValue = parseInt(value);
                    return isNaN(parsedValue) ? '' : parsedValue;
                  }}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="sku"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>SKU</span>
            }
          >
            <Input
              prefix={
                <FiTag style={{ color: "#1890ff", fontSize: "16px" }} />
              }
              placeholder="Enter SKU"
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>

          <Form.Item
            name="hsn_sac"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                HSN/SAC
              </span>
            }
          >
            <Input
              prefix={
                <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
              }
              placeholder="Enter HSN/SAC code"
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>
          <Form.Item
            name="tax_name"
            label={
              <span style={{ color: "#374151", fontWeight: 500 }}>
                Tax Name
              </span>
            }
          >
            <Input 
              placeholder="Enter tax name (e.g. GST, VAT)" 
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb"
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="tax_percentage"
            label={
              <span style={{ color: "#374151", fontWeight: 500 }}>
                Tax Percentage
              </span>
            }
            rules={[
              {
                validator: (_, value) => {
                  if (value && value < 0) {
                    return Promise.reject('Tax percentage cannot be negative');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              placeholder="Enter tax percentage"
              min={0}
              max={100}
              addonAfter="%"
              style={{ 
                width: "100%",
                borderRadius: "10px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>
        </div>

        <Divider />

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
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Stock Quantity</span>}
            rules={ validateStockQuantities.stock_quantity}
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
            rules={validateStockQuantities.min_stock_level}
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
            rules={validateStockQuantities.max_stock_level}
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
            rules={validateStockQuantities.reorder_quantity}
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

        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Additional Information</Text>
        </div>
        <Form.Item
          name="description"
          label={<span style={{ color: '#374151', fontWeight: 500 }}>Description</span>}
          initialValue={initialValues?.description}
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
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Update Product
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

export default EditProduct;
