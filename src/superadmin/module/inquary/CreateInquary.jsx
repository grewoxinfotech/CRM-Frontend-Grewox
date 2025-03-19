import React from 'react';
import { Modal, Form, Input, Button, Typography, Divider, message } from 'antd';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiX, FiBook } from 'react-icons/fi';
import { useCreateInquiryMutation, useUpdateInquiryMutation } from './services/inquaryApi';
import { useDispatch } from 'react-redux';
import { addInquiry, updateInquiry } from './services/inquarySlice';

const { Text } = Typography;

const CreateInquary = ({ open, onCancel, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [createInquiry, { isLoading: isCreating }] = useCreateInquiryMutation();
    const [updateInquiryMutation, { isLoading: isUpdating }] = useUpdateInquiryMutation();

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                const response = await updateInquiryMutation({ 
                    id: initialValues.id, 
                    data: values 
                }).unwrap();
                
                dispatch(updateInquiry({ 
                    id: initialValues.id, 
                    data: response.data 
                }));
                message.success('Inquiry updated successfully');
            } else {
                const response = await createInquiry(values).unwrap();
                dispatch(addInquiry(response.data));
                message.success('Inquiry created successfully');
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
                        <FiMessageSquare style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            {isEditing ? 'Edit Inquiry' : 'Create New Inquiry'}
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            {isEditing ? 'Update inquiry information' : 'Fill in the information to create inquiry'}
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
                    name="name"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Name
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter name' }]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter name"
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
                    name="phone"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Phone Number
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                    <Input
                        prefix={<FiPhone style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter phone number"
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
                    name="subject"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Subject
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter subject' }]}
                >
                    <Input
                        prefix={<FiBook style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter subject"
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
                    name="message"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Message
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter message' }]}
                >
                    <Input.TextArea
                        placeholder="Enter your message"
                        size="large"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
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
                        {isEditing ? 'Update Inquiry' : 'Create Inquiry'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateInquary;
