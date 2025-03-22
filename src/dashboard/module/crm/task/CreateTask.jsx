import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Select, DatePicker, Row, Col, Divider, Upload } from 'antd';
import { FiCheckSquare, FiX, FiCalendar, FiFlag, FiMapPin, FiUser, FiUpload } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateTask = ({ open, onCancel, onSubmit, isEditing, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) {
            const formattedValues = {
                ...initialValues,
                startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
                dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
            };
            form.setFieldsValue(formattedValues);
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                startDate: values.startDate?.format('YYYY-MM-DD'),
                dueDate: values.dueDate?.format('YYYY-MM-DD'),
            };
            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            console.error('Submit Error:', error);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
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
                        <FiCheckSquare style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing ? 'Update task information' : 'Fill in the information to create task'}
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
                <Form.Item
                    name="taskName"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Task Name
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter task name' },
                        { max: 100, message: 'Task name cannot exceed 100 characters' }
                    ]}
                >
                    <Input
                        prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter task name"
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
                                placeholder="Select category"
                                size="large"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                            >
                                <Option value="Design">Design</Option>
                                <Option value="Development">Development</Option>
                                <Option value="Marketing">Marketing</Option>
                                <Option value="Sales">Sales</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="lead"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Lead
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select lead' }]}
                        >
                            <Select
                                placeholder="Select lead"
                                size="large"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                            >
                                <Option value="John Doe">John Doe</Option>
                                <Option value="Jane Smith">Jane Smith</Option>
                                <Option value="Mike Johnson">Mike Johnson</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

               

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Start Date
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select start date' }]}
                        >
                            <DatePicker
                                size="large"
                                format="DD-MM-YYYY"
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
                    <Col span={12}>
                        <Form.Item
                            name="dueDate"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Due Date
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select due date' }]}
                        >
                            <DatePicker
                                size="large"
                                format="DD-MM-YYYY"
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
                            name="priority"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Priority
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select priority' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select priority"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                suffixIcon={<FiFlag style={{ color: '#1890ff' }} />}
                            >
                                <Option value="High">High</Option>
                                <Option value="Medium">Medium</Option>
                                <Option value="Low">Low</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Status
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select status"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                            >
                                <Option value="Todo">Todo</Option>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Completed">Completed</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="assignedTo"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Assigned To
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select assignee' }]}
                >
                    <Select
                        size="large"
                        placeholder="Select assignee"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                        }}
                        suffixIcon={<FiUser style={{ color: '#1890ff' }} />}
                    >
                        <Option value="John Doe">John Doe</Option>
                        <Option value="Sarah Smith">Sarah Smith</Option>
                        <Option value="Emily Brown">Emily Brown</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="task_reporter"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Task Reporter
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select task reporter' }]}
                >
                    <Select
                        size="large"
                        placeholder="Select task reporter"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                        }}
                        suffixIcon={<FiUser style={{ color: '#1890ff' }} />}
                    >
                        <Option value="John Doe">John Doe</Option>
                        <Option value="Sarah Smith">Sarah Smith</Option>
                        <Option value="Emily Brown">Emily Brown</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        placeholder="Enter task description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="task_file"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Task File
                        </span>
                    }
                >
                    <Upload
                        maxCount={1}
                        beforeUpload={() => false}
                        style={{
                            width: '100%',
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
                            Click to Upload File
                        </Button>
                    </Upload>
                </Form.Item>

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
                        {isEditing ? 'Update Task' : 'Create Task'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTask; 