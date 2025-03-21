import React from 'react';
import { Modal, Form, Input, Button, Typography, Divider, message, Alert } from 'antd';
import { FiUser, FiMail, FiLock, FiX } from 'react-icons/fi';
import { useCreateSubclientMutation } from './services/subClientApi';
import { useDispatch } from 'react-redux';
import { setIsModalOpen } from './services/subClientSlice';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const CreateSubclient = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [createSubclient, { isLoading }] = useCreateSubclientMutation();

    const handleSubmit = async (values) => {
        try {
            const result = await createSubclient(values).unwrap();
            
            if (result.success) {
                message.success('Subclient created successfully');
                form.resetFields();
                dispatch(setIsModalOpen(false));
                onCancel();
                navigate('/dashboard/subclient');
            } else {
                message.error(result.message || 'Failed to create subclient');
            }
        } catch (error) {
            console.error('Create Subclient Error:', error);
            message.error(error?.data?.message || 'Failed to create subclient');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        dispatch(setIsModalOpen(false));
        onCancel();
    };

    return (
        <>
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
                            <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2 style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}>
                                Create New Subclient
                            </h2>
                            <Text style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)'
                            }}>
                                Fill in the information to create subclient
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
                        rules={[
                            { required: true, message: 'Please enter username' },
                            { min: 3, message: 'Username must be at least 3 characters' }
                        ]}
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
                            { required: true, message: 'Please enter password' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                            {
                                pattern: /^[a-zA-Z0-9!@#$%^&*]{8,30}$/,
                                message: 'Create a strong password with letters, numbers, and special characters'
                            }
                        ]}
                        extra={
                            <Text type="secondary" style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                display: 'block'
                            }}>
                                Password must be at least 8 characters long with letters, numbers, and special characters
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
                            size="large"
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
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
                            Create Account
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default CreateSubclient;
