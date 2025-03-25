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
import { useCreateJobMutation, useUpdateJobMutation } from './services/jobApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';

// Initialize dayjs plugins
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

const skillOptions = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'HTML/CSS',
    'TypeScript',
    'Docker',
    'AWS',
    // Add more skills as needed
];

const interviewRoundOptions = [
    'Technical Round',
    'HR Round',
    'System Design',
    'Coding Test',
    'Cultural Fit',
    'Final Interview'
];

const CreateJob = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [createJob] = useCreateJobMutation();
    const [updateJob] = useUpdateJobMutation();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    useEffect(() => {
        if (currencies?.length && !isEditing) {
            const defaultCurrency = currencies.find(c => c.currencyCode === 'INR') || currencies[0];
            form.setFieldValue('currency', defaultCurrency.currencyCode);
        }
    }, [currencies, form, isEditing]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Format the initial values for editing
                const formattedValues = {
                    ...initialValues,
                    // Format dates
                    startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
                    endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,

                    skills: initialValues.skills?.Skills || [],

                    // Extract and format interview rounds
                    interviewRounds: initialValues.interviewRounds?.InterviewRounds || [],

                    // Keep other fields as they are
                    title: initialValues.title,
                    category: initialValues.category,
                    location: initialValues.location,
                    totalOpenings: initialValues.totalOpenings,
                    status: initialValues.status,
                    recruiter: initialValues.recruiter,
                    jobType: initialValues.jobType || 'Full-time',
                    workExperience: initialValues.workExperience,
                    currency: initialValues.currency || 'INR',
                    expectedSalary: initialValues.expectedSalary,
                    description: initialValues.description
                };

                // Ensure dates are valid before setting
                if (formattedValues.startDate && !dayjs.isDayjs(formattedValues.startDate)) {
                    formattedValues.startDate = null;
                }
                if (formattedValues.endDate && !dayjs.isDayjs(formattedValues.endDate)) {
                    formattedValues.endDate = null;
                }
                
                form.setFieldsValue(formattedValues);
            } else {
                // Set default values for new job
                form.setFieldsValue({
                    status: 'active',
                    jobType: 'Full-time',
                    currency: '₹'
                });
                
                // If currencies are loaded but we still want INR as default
                if (currencies?.length > 0) {
                    const inrCurrency = currencies.find(c => c.currencyCode === '₹');
                    if (inrCurrency) {
                        form.setFieldValue('currency', '₹');
                    }
                }
            }
        }
    }, [open, form, initialValues, currencies]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format dates properly
            let startDate = null;
            let endDate = null;
            
            if (values.startDate) {
                if (dayjs.isDayjs(values.startDate)) {
                    startDate = values.startDate.format('YYYY-MM-DD');
                } else {
                    startDate = dayjs(values.startDate).format('YYYY-MM-DD');
                }
            }
            
            if (values.endDate) {
                if (dayjs.isDayjs(values.endDate)) {
                    endDate = values.endDate.format('YYYY-MM-DD');
                } else {
                    endDate = dayjs(values.endDate).format('YYYY-MM-DD');
                }
            }

            // Format the data according to the required payload structure
            const formattedValues = {
                title: values.title,
                category: values.category,
                skills: {
                    Skills: values.skills  // Changed to match API response format
                },
                location: values.location,
                interviewRounds: {
                    InterviewRounds: values.interviewRounds  // Changed to match API response format
                },
                startDate: startDate,
                endDate: endDate,
                totalOpenings: values.totalOpenings || 1,
                status: values.status,
                recruiter: values.recruiter,
                jobType: values.jobType, // Ensure jobType is included and required
                workExperience: values.workExperience,
                currency: values.currency,
                expectedSalary: values.expectedSalary,
                description: values.description
            };

            // Validate required fields
            const requiredFields = ['title', 'category', 'location', 'jobType', 'workExperience', 'recruiter'];
            for (const field of requiredFields) {
                if (!formattedValues[field]) {
                    console.error(`${field} is missing!`);
                    message.error(`${field} is required`);
                    return;
                }
            }

            // Check if jobType exists, if not, add a default
            if (!formattedValues.jobType) {
                console.error('JobType is missing!');
                formattedValues.jobType = 'Full-time';
            }

            // Ensure title is present
            if (!formattedValues.title) {
                console.error('Title is missing!');
                throw new Error('Title is required');
            }

            if (isEditing && initialValues?.id) {

               await updateJob({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success('Job updated successfully!');
            } else {
                const response = await createJob(formattedValues).unwrap();
                message.success('Job created successfully!');
            }

            onCancel();
        } catch (error) {
            message.error(error.data?.message || 'Please check your input and try again.');
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
                initialValues={{ 
                    status: 'active',
                    jobType: 'Full-time',
                    currency: 'INR'
                }}
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
                        name="skills"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Skills
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select skills' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select required skills"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                minHeight: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {skillOptions.map(skill => (
                                <Option key={skill} value={skill}>{skill}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="interviewRounds"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Interview Rounds
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select interview rounds' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select interview rounds"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                minHeight: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {interviewRoundOptions.map(round => (
                                <Option key={round} value={round}>{round}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="workExperience"
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
                        name="startDate"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Start Date
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter start date' }]}
                    >
                        <DatePicker
                            size="large"
                            format="YYYY-MM-DD"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                End Date
                            </span>
                        }
                        dependencies={['startDate']}
                        rules={[
                            { required: true, message: 'Please select end date' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('startDate');
                                    if (!startDate || !value) {
                                        return Promise.resolve();
                                    }
                                    
                                    if (dayjs.isDayjs(value) && dayjs.isDayjs(startDate)) {
                                        if (value.isAfter(startDate)) {
                                            return Promise.resolve();
                                        }
                                    }
                                    
                                    return Promise.reject(new Error('End date must be after start date'));
                                }
                            })
                        ]}
                    >
                        <DatePicker
                            size="large"
                            format="YYYY-MM-DD"
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
                        name="jobType"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Type
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select job type' }]}
                    >
                        <Select
                            placeholder="Select job type"
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

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="expectedSalary"
                            label={
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}>
                                    Expected Salary
                                </span>
                            }
                            style={{ flex: 1 }}
                        >
                            <Input.Group compact className="price-input-group" style={{
                                display: 'flex',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                overflow: 'hidden',
                                marginBottom: 0
                            }}>
                                <Form.Item
                                    name="currency"
                                    noStyle
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        size="large"
                                        style={{
                                            width: '80px',
                                            height: '48px'
                                        }}
                                        loading={currenciesLoading}
                                        className="currency-select"
                                        defaultValue="INR"
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {currencies?.map(currency => (
                                            <Option 
                                                key={currency.currencyCode} 
                                                value={currency.currencyCode}
                                                selected={currency.currencyCode === 'INR'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{currency.currencyIcon}</span>
                                                    <span>{currency.currencyCode}</span>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="expectedSalary"
                                    noStyle
                                    rules={[{ required: true, message: 'Please enter price' }]}
                                >
                                    <Input
                                        placeholder="Enter price"
                                        size="large"
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            border: 'none',
                                            borderLeft: '1px solid #e6e8eb',
                                            borderRadius: 0,
                                            height: '48px',
                                        }}
                                        className="price-input"
                                    />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>

                    </div>

                    <Form.Item
                        name="location"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
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
