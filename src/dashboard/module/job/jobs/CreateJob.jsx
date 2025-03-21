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
import { FiUser, FiFileText, FiMapPin, FiBriefcase, FiDollarSign, FiX, FiClock } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship'
];

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

const experienceLevels = [
    'Entry Level',
    '1-3 years',
    '3-5 years',
    '5-7 years',
    '7+ years'
];

const CreateJob = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            console.log('Modal Opened');
            form.resetFields();
            if (initialValues) {
                const formattedValues = {
                    ...initialValues,
                    start_date: initialValues.start_date ? dayjs(initialValues.start_date) : undefined,
                    end_date: initialValues.end_date ? dayjs(initialValues.end_date) : undefined
                };
                console.log('Setting Initial Values:', formattedValues);
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form Values:', values);

            const formattedValues = {
                ...values,
                id: initialValues?.id,
                start_date: values.start_date?.format('YYYY-MM-DD'),
                end_date: values.end_date?.format('YYYY-MM-DD'),
                created_at: initialValues?.created_at || dayjs().format('YYYY-MM-DD'),
                updated_at: dayjs().format('YYYY-MM-DD')
            };

            console.log('Submitting Values:', formattedValues);
            await onSubmit(formattedValues);
            message.success(isEditing ? 'Job updated successfully!' : 'Job created successfully!');
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Form Error:', error);
            message.error('Please check your input and try again.');
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
                            {isEditing ? 'Edit Job' : 'Create New Job'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update job information'
                                : 'Fill in the information to create job'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ ...initialValues, status: 'active' }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="title"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Title
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter job title' },
                            { max: 100, message: 'Job title cannot exceed 100 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter job title"
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
                                height: '48px',
                            }}
                        >
                            {departments.map(dept => (
                                <Option key={dept} value={dept}>{dept}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="interview_round"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Interview Round
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select interview round' }]}
                    >
                        <Select
                            placeholder="Select interview round"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {jobTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="work_experience"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Work Experience
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select work experience' }]}
                    >
                        <Select
                            placeholder="Select work experience"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {experienceLevels.map(exp => (
                                <Option key={exp} value={exp}>{exp}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="recruiter"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Recruiter
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter recruiter' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter recruiter"
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
                        name="start_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Start Date
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter start date' }]}
                    >
                        <DatePicker
                            size="large"
                            format="DD-MM-YYYY"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="end_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                End Date
                            </span>
                        }
                        dependencies={['start_date']}
                        rules={[
                            { required: true, message: 'Please select end date' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('start_date');
                                    if (!startDate || !value) {
                                        return Promise.resolve();
                                    }
                                    if (value.isAfter(startDate)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('End date must be after start date'));
                                }
                            })
                        ]}
                    >
                        <DatePicker
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
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="draft">Draft</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="expected_salary"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Expected Salary
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter expected salary' }]}
                    >
                        <InputNumber
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter expected salary"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="job_location"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500'  }}>
                                Job Location
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter job location' }]}
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter job location"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px', 
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                        />
                    </Form.Item>    
                    
                    
                    
                </div>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Job Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter job description' }]}
                >
                    <TextArea
                        placeholder="Enter detailed job description"
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
                        {isEditing ? 'Update Job' : 'Create Job'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJob; 