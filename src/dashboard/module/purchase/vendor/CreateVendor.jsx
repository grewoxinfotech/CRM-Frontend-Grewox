import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, DatePicker, Row, Col, Divider, Upload, message } from 'antd';
import { FiDollarSign, FiX, FiCalendar, FiUser, FiHash, FiUpload, FiBriefcase, FiCreditCard, FiFileText, FiTag } from 'react-icons/fi';
import dayjs from 'dayjs';
import './vendor.scss';
import { useCreateVendorMutation } from './services/vendorApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateVendor = ({ open, onCancel, onSubmit }) => {
    const [createVendor] = useCreateVendorMutation();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const handleSubmit = async (values) => {
        try {
            await createVendor(values).unwrap();
            message.success('Vendor created successfully');
            form.resetFields();
            onCancel(); // Close modal after success
        } catch (error) {
            console.error('Submit Error:', error);
            message.error('Failed to create vendor');
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
                        <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Create New Vendor
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Fill in the information to create vendor
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
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter name' }]}
                        >
                            <Input
                                placeholder="Enter name"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="contact"
                            label="Contact"
                            rules={[{ required: true, message: 'Please enter contact' }]}
                        >
                            <Input
                                placeholder="Enter contact"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                        >
                            <Input
                                placeholder="Enter email address (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="taxNumber"
                            label="Tax Number"
                        >
                            <Input
                                placeholder="Enter tax number (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="address"
                    label="Address"
                >
                    <TextArea
                        placeholder="Enter complete address (optional)"
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                        }}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="city"
                            label="City"
                        >
                            <Input
                                placeholder="Enter city (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="state"
                            label="State"
                        >
                            <Input
                                placeholder="Enter state (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="country"
                            label="Country"
                        >
                            <Input
                                placeholder="Enter country (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="zipcode"
                            label="Zipcode"
                        >
                            <Input
                                placeholder="Enter zipcode (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
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
                        Create Vendor
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateVendor;