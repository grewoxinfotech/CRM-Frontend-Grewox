import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Row, Col, Divider, DatePicker, message, Upload } from 'antd';
import { FiDollarSign, FiX, FiCalendar, FiUser, FiHash, FiUpload, FiBriefcase, FiCreditCard, FiFileText, FiTag } from 'react-icons/fi';
import dayjs from 'dayjs';
import './revenue.scss';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditRevenue = ({ open, onCancel, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                date: initialValues.date ? dayjs(initialValues.date) : null
            });
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            
         
            formData.append('date', values.date?.format('DD-MM-YYYY') || '');
            formData.append('currency', values.currency || '');
            formData.append('amount', values.amount || '');
            formData.append('account', values.account || '');
            formData.append('customer', values.customer || '');
            formData.append('description', values.description || '');
            formData.append('category', values.category || '');

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('paymentReceipt', fileList[0].originFileObj);
            }

            await onSubmit(formData);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error('Submit Error:', error);
            message.error('Failed to update revenue');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    <FiX style={{ fontSize: '20px' }} />
                </Button>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FiDollarSign style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            Edit Revenue
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Update revenue information
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Row gutter={16}>
                <Col span={12}>
                        <Form.Item
                            name="category"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Category
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select category"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                suffixIcon={<FiTag style={{ color: '#1890ff' }} />}
                            >
                                <Option value="sales">Sales</Option>
                                <Option value="services">Services</Option>
                                <Option value="investments">Investments</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Date
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker
                                size="large"
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiCalendar style={{ color: '#1890ff' }} />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="currency"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Currency
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select currency' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select currency"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                suffixIcon={<FiCreditCard style={{ color: '#1890ff' }} />}
                            >
                                <Option value="INR">INR - Indian Rupee</Option>
                                <Option value="USD">USD - US Dollar</Option>
                                <Option value="EUR">EUR - Euro</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="amount"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Amount
                                </span>
                            }
                            rules={[{ required: true, message: 'Please enter amount' }]}
                        >
                            <Input
                                type="number"
                                prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter amount"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="account"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Account
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select account' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select account"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                suffixIcon={<FiBriefcase style={{ color: '#1890ff' }} />}
                            >
                                <Option value="cash">Cash</Option>
                                <Option value="bank">Bank Account</Option>
                                <Option value="wallet">Digital Wallet</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="customer"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Customer
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select customer' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select customer"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                suffixIcon={<FiUser style={{ color: '#1890ff' }} />}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option value="1">John Doe</Option>
                                <Option value="2">Jane Smith</Option>
                                <Option value="3">Robert Johnson</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Description
                        </span>
                    }
                >
                    <TextArea
                        placeholder="Enter description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                    />
                </Form.Item>

                <Row gutter={16}>
                   
                    <Col span={12}>
                        <Form.Item
                            name="paymentReceipt"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Payment Receipt
                                </span>
                            }
                        >
                            <Upload
                                maxCount={1}
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={(file) => {
                                    const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
                                    if (!isValidType) {
                                        message.error('You can only upload JPG/PNG/PDF files!');
                                        return Upload.LIST_IGNORE;
                                    }
                                    return false;
                                }}
                            >
                                <Button
                                    icon={<FiUpload style={{ marginRight: '8px' }} />}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    Click to Upload Receipt
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        }}
                    >
                        Update Revenue
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditRevenue;