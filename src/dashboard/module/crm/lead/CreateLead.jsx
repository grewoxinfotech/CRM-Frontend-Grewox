import React from 'react';
import { Modal, Form, Input, Button, Typography, Select, Divider, Upload } from 'antd';
import {
    FiUser, FiMail, FiPhone, FiX, FiBriefcase,
    FiHash, FiDollarSign, FiMapPin, FiCamera
} from 'react-icons/fi';

const { Text } = Typography;
const { Option } = Select;

const CreateLead = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = React.useState([]);

    const handleSubmit = async (values) => {
        try {
            console.log('Creating lead:', values);
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Create Lead Error:', error);
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Create New Lead
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the information to create lead
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>

                    <div style={{ flex: 1 }}>
                        <Form.Item
                            name="leadTitle"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Lead Title</span>}
                            rules={[
                                { required: true, message: 'Please enter lead title' },
                                { min: 3, message: 'Lead title must be at least 3 characters' }
                            ]}
                        >
                            <Input
                                prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
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
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <Form.Item
                        name="firstName"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                First Name
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter first name"
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
                        name="lastName"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Last Name
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter last name"
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
                        name="leadStage"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Lead Stage
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select lead stage"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="new">New</Option>    
                            <Option value="contacted">Contacted</Option>
                            <Option value="qualified">Qualified</Option>
                            <Option value="proposal">Proposal</Option>
                            <Option value="negotiation">Negotiation</Option>
                            <Option value="closed">Closed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Currency
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select currency"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="USD">USD</Option>
                            <Option value="EUR">EUR</Option>
                            <Option value="GBP">GBP</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="leadValue"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Lead Value
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter lead value"
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
                        name="telephone"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Telephone
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiPhone style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter telephone number"
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
                        name="assigned"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Assigned To
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select assignee"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="user1">User 1</Option>
                            <Option value="user2">User 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="lead_members"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Lead Members
                            </span>
                        }
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select lead members"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="member1">Member 1</Option>
                            <Option value="member2">Member 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="source"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Source
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select source"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="website">Website</Option>
                            <Option value="referral">Referral</Option>
                            <Option value="social">Social Media</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Category
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select category"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="cat1">Category 1</Option>
                            <Option value="cat2">Category 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Tags
                            </span>
                        }
                    >
                        <Select
                            mode="tags"
                            placeholder="Add tags"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="tag1">Tag 1</Option>
                            <Option value="tag2">Tag 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="files"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Files
                            </span>
                        }
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select files"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="file1">File 1</Option>
                            <Option value="file2">File 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Status
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select status"
                            size="large"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Option value="new">New</Option>
                            <Option value="in_progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="company_name"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Company Name
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter company name"
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
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Client ID
                            </span>
                        }
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
                        Create Lead
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateLead; 