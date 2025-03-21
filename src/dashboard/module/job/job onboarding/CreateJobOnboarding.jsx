import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Select,
    InputNumber,
    DatePicker
} from 'antd';
import { FiUser, FiFileText, FiMapPin, FiBriefcase, FiDollarSign, FiX, FiClock, FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const departments = [
    'Engineering',
    'Product',
    'Marketing',
    'Sales',
    'Customer Support',
    'Human Resources',
    'Finance',
    'Operations'
];

const statuses = [
    'pending',
    'in_progress',
    'completed',
    'delayed'
];

const salaryTypes = [
    'Monthly',
    'Annual',
    'Weekly',
    'Hourly'
];

const salaryDurations = [
    'Monthly',
    'Annual',
    'Weekly',
    'Hourly'
];

const jobTypes = [
    'Full-Time',
    'Part-Time',
    'Contract',
];
const CreateJobOnboarding = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                const formattedValues = {
                    ...initialValues,
                    joining_date: initialValues.joining_date ? dayjs(initialValues.joining_date) : undefined,
                    orientation_date: initialValues.orientation_date ? dayjs(initialValues.orientation_date) : undefined
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                joining_date: values.joining_date ? values.joining_date.format('YYYY-MM-DD') : undefined,
                orientation_date: values.orientation_date ? values.orientation_date.format('YYYY-MM-DD') : undefined
            };
            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
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
                '--antd-arrow-background-color': '#ffffff',
            }}
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
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Onboarding' : 'Create New Onboarding'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update onboarding information'
                                : 'Fill in the information to create onboarding'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ 
                    ...initialValues, 
                    status: 'pending',
                    tasks_completed: '0/10',
                    documents_submitted: '0/5'
                }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="interviewer"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Interviewer
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter interviewer' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter interviewer"
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
                        name="joining_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Joining Date
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter joining date' }]}
                    >
                        <DatePicker
                            prefix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Select joining date"
                            size="large"
                            format="DD-MM-YYYY"
                            style={{
                                width: '100%',
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
                        name="days_of_week"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Days of Week
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select days of week' }]}
                    >
                       <Input
                            prefix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter days of week"
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
                            {/* daysOfWeek.map(day => (
                                <Option key={day} value={day}>{day}</Option>
                            )) */}
                       
                    </Form.Item>

                    <Form.Item
                        name="salary"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter salary' }]}
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter salary"
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
                        name="salary_type"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary Type
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select salary type' }]}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {salaryTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="salary_duration"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary Duration
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please select salary duration' }
                        ]}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {salaryDurations.map(duration => (
                                <Option key={duration} value={duration}>{duration}</Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {statuses.map(status => (
                                <Option key={status} value={status}>
                                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="job_type"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Type
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select job type' }]}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {jobTypes.map(type => (
                                <Option key={type} value={type}>
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

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
                        loading={loading}
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
                        {isEditing ? 'Update Onboarding' : 'Create Onboarding'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJobOnboarding; 