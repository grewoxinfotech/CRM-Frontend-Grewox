import React from 'react';
import { Modal, Form, Input, Button, Typography, Select, Divider, DatePicker, InputNumber } from 'antd';
import {
    FiUser, FiMail, FiPhone, FiX, FiBriefcase,
    FiHash, FiDollarSign, FiMapPin, FiCamera, FiFolder, FiCalendar, FiClock
} from 'react-icons/fi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreateProjectModal = ({ visible, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const [startDate, endDate] = values.project_duration || [];
            onSubmit({
                ...values,
                startDate: startDate?.format('YYYY-MM-DD'),
                endDate: endDate?.format('YYYY-MM-DD'),
            });
        });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={null}
            open={visible}
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
                        <FiFolder style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Create New Project
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the information to create project
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
                            name="project_name"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Project Name</span>}
                            rules={[
                                { required: true, message: 'Please enter project name' },
                                { min: 3, message: 'Project name must be at least 3 characters' }
                            ]}
                        >
                            <Input
                                prefix={<FiFolder style={{ color: '#1890ff', fontSize: '16px' }} />}
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
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <Form.Item
                        name="project_duration"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Project Duration</span>}
                        rules={[{ required: true, message: 'Please select project duration' }]}
                    >
                        <RangePicker
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb'
                            }}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="project_category"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Category</span>}
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select
                            placeholder="Select project category"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px'
                            }}
                        >
                            <Option value="web">Web Development</Option>
                            <Option value="mobile">Mobile App</Option>
                            <Option value="design">Design</Option>
                            <Option value="marketing">Marketing</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="budget"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Budget</span>}
                        rules={[{ required: true, message: 'Please enter budget' }]}
                    >
                        <InputNumber
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb'
                            }}
                            size="large"
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Currency</span>}
                    >
                        <Select
                            placeholder="Select currency"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px'
                            }}
                        >
                            <Option value="USD">USD</Option>
                            <Option value="EUR">EUR</Option>
                            <Option value="GBP">GBP</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="estimatedmonths"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Estimated Months</span>}
                    >
                        <Input
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter estimated months"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="estimatedhours"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Estimated Hours</span>}
                    >
                        <InputNumber
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter estimated hours"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="client"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Client</span>}
                    >
                        <Select
                            placeholder="Select client"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px'
                            }}
                        >
                            <Option value="client1">Client 1</Option>
                            <Option value="client2">Client 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Status</span>}
                    >
                        <Select
                            placeholder="Select status"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px'
                            }}
                        >
                            <Option value="not-started">Not Started</Option>
                            <Option value="in-progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tag"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Tag</span>}
                    >
                        <Select
                            placeholder="Select tag"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px'
                            }}
                        >
                            <Option value="urgent">Urgent</Option>
                            <Option value="normal">Normal</Option>
                            <Option value="low">Low Priority</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="project_description"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Description</span>}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter project description"
                        style={{
                            borderRadius: '10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb'
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
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
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
                        Create Project
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateProjectModal;