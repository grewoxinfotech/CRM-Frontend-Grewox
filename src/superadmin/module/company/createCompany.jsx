import React from 'react';
import { Modal, Form, Input, Button, Typography, Divider, message } from 'antd';
import { FiUser, FiMail, FiLock, FiBriefcase, FiX } from 'react-icons/fi';
import { useCreateCompanyMutation, useUpdateCompanyMutation } from './services/companyApi';

const { Text } = Typography;

const CreateCompany = ({ open, onCancel, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateCompany({ id: initialValues.id, data: values }).unwrap();
                message.success('Company updated successfully');
            } else {
                await createCompany(values).unwrap();
                message.success('Company created successfully');
            }
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error(error?.data?.message || 'Something went wrong');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
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
                        transition: 'all 0.3s ease'
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
                        <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            {isEditing ? 'Edit Company' : 'Create New Company'}
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            {isEditing ? 'Update company information' : 'Fill in the information to create company'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
            >
                <Form.Item
                    name="username"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Username
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter username' }]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter username"
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
                    name="email"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Email
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input
                        prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter email"
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
                    name="password"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Password
                        </span>
                    }
                    rules={[
                        { required: !isEditing, message: 'Please enter password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                    extra={
                        <Text type="secondary" style={{
                            fontSize: '12px',
                            marginTop: '4px',
                            display: 'block'
                        }}>
                            Password must be at least 6 characters long
                        </Text>
                    }
                >
                    <Input.Password
                        prefix={<FiLock style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter password"
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

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={onCancel}
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
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isEditing ? 'Update Account' : 'Create Account'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCompany;