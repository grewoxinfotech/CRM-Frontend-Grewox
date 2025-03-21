import React from 'react';
import { Modal, Form, Input, Button, Typography, Select, Divider, Upload } from 'antd';
import {
    FiUser, FiMail, FiPhone, FiX, FiBriefcase,
    FiHash, FiDollarSign, FiMapPin, FiCamera
} from 'react-icons/fi';

const { Text } = Typography;
const { Option } = Select;

const EditDeal = ({ open, onCancel, initialValues }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            console.log('Updating deal:', values);
            onCancel();
        } catch (error) {
            console.error('Edit Deal Error:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    icon={<FiX />}
                    onClick={handleCancel}
                    style={{
                        color: '#ffffff',
                        position: 'absolute',
                        right: '24px',
                        top: '24px',
                    }}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiDollarSign style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Edit Deal
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Update deal information
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
                    padding: '24px'
                }}
                initialValues={initialValues}
            >
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <Form.Item
                        name="leadTitle"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Lead Title</span>}
                        rules={[
                            { required: true, message: 'Please enter lead title' },
                            { min: 3, message: 'Lead title must be at least 3 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter lead title"
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

                    <Form.Item
                        name="dealName"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Deal Name</span>}
                        rules={[
                            { required: true, message: 'Please enter deal name' },
                            { min: 3, message: 'Deal name must be at least 3 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter deal name"
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

                    <Form.Item
                        name="pipeline"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Pipeline</span>}
                        rules={[{ required: true, message: 'Please select pipeline' }]}
                    >
                        <Select
                            placeholder="Select pipeline"
                            size="large"
                            style={{ borderRadius: '10px' }}
                        >
                            <Option value="sales">Sales Pipeline</Option>
                            <Option value="marketing">Marketing Pipeline</Option>
                            <Option value="support">Support Pipeline</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="stage"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Stage</span>}
                        rules={[{ required: true, message: 'Please select stage' }]}
                    >
                        <Select
                            placeholder="Select stage"
                            size="large"
                            style={{ borderRadius: '10px' }}
                        >
                            <Option value="new">New</Option>
                            <Option value="qualified">Qualified</Option>
                            <Option value="proposition">Proposition</Option>
                            <Option value="negotiation">Negotiation</Option>
                            <Option value="closed">Closed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Currency</span>}
                        rules={[{ required: true, message: 'Please select currency' }]}
                    >
                        <Select
                            placeholder="Select currency"
                            size="large"
                            style={{ borderRadius: '10px' }}
                        >
                            <Option value="USD">USD</Option>
                            <Option value="EUR">EUR</Option>
                            <Option value="GBP">GBP</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Price</span>}
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter price"
                            size="large"
                            type="number"
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

                    <Form.Item
                        name="closedDate"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Closed Date</span>}
                    >
                        <Input
                            type="date"
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

                    <Form.Item
                        name="project"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Project</span>}
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter project name"
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

                    <Form.Item
                        name="client_id"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Client ID</span>}
                        rules={[{ required: true, message: 'Please enter client ID' }]}
                    >
                        <Input
                            prefix={<FiHash style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter client ID"
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
                </div>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={handleCancel}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Update Deal
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditDeal; 