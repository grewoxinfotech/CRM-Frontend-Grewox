import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    TimePicker,
    Upload,
    message,
    Tag
} from 'antd';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiDollarSign, FiX, FiClock, FiUpload } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCreateJobApplicationMutation, useUpdateJobApplicationMutation } from './services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllCountriesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import ColumnGroup from 'antd/es/table/ColumnGroup';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { Option } = Select;

const statuses = [
    'pending',
    'shortlisted',
    'interviewed',
    'rejected'
];

const experienceLevels = [
    'Entry Level',
    '1-3 years',
    '3-5 years',
    '5-7 years',
    '7+ years'
];

const CreateJobApplication = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createJobApplication, { isLoading: isCreating }] = useCreateJobApplicationMutation();
    const [updateJobApplication, { isLoading: isUpdating }] = useUpdateJobApplicationMutation();
    const { data: jobs, isLoading: isLoadingJobs } = useGetAllJobsQuery();
    const { data: countries, isLoading: countriesLoading } = useGetAllCountriesQuery();



    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Format phone number from +91XXXXXXXXXX to separate code and number
                const phoneMatch = initialValues.phone?.match(/^\+(\d{2,3})(\d+)$/);
                const formattedValues = {
                    ...initialValues,
                    phoneCode: phoneMatch ? phoneMatch[1] : '91',
                    phoneNumber: phoneMatch ? phoneMatch[2] : '',
                    interview_date: initialValues.interview_date ? dayjs(initialValues.interview_date) : undefined,
                    interview_time: initialValues.interview_time ? dayjs(initialValues.interview_time, 'HH:mm A') : undefined
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, initialValues]);

    const handleSubmit = async (values) => { 
        try {
            // Create FormData instance
            const formData = new FormData();
            
            // Extract file and phone details
            const { cv_path, phoneCode, phoneNumber, ...otherValues } = values;

            // Add the file if it exists
            if (cv_path?.fileList?.[0]?.originFileObj) {
                formData.append('file', cv_path.fileList[0].originFileObj);
            }

            // Format phone number
            const phone = phoneCode && phoneNumber ? `+${phoneCode}${phoneNumber}` : '';

            // Add all other fields to formData
            const payload = {
                ...otherValues,
                phone,
                client_id: localStorage.getItem('client_id'),
                created_by: localStorage.getItem('user_id')
            };

            // Append all other fields to formData
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (isEditing) {
                await updateJobApplication({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Job application updated successfully');
            } else {
                await createJobApplication(formData).unwrap();
                message.success('Job application created successfully');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job application`);
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending'},
        { value: 'shortlisted', label: 'Shortlisted'},
        { value: 'interviewed', label: 'Interviewed'},
        { value: 'selected', label: 'Selected'},
        { value: 'rejected', label: 'Rejected' }
    ];

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
                            {isEditing ? 'Edit Application' : 'Create New Application'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update application information'
                                : 'Fill in the information to create application'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ ...initialValues, status: 'pending' }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="job"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job Position</span>}
                        rules={[{ required: true, message: 'Please select a job position' }]}
                    >
                        <Select
                            placeholder="Select job position"
                            loading={isLoadingJobs}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {jobs?.data?.map((job) => (
                                <Option key={job.id} value={job.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiBriefcase style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{job.title}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Name</span>}
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
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Email</span>}
                        rules={[{ required: true, message: 'Please enter email', type: 'email' }]}
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
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Phone Number
                            </span>
                        }
                        required
                    >
                        <Input.Group compact className="phone-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden'
                        }}>
                            <Form.Item
                                name="phoneCode"
                                noStyle
                                rules={[{ required: true, message: 'Required' }]}
                                initialValue="91"
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '80px',
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                    }}
                                    loading={countriesLoading}
                                    className="phone-code-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        backgroundColor: 'white',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {countries?.map(country => (
                                        <Option 
                                            key={country.phoneCode} 
                                            value={country.phoneCode}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: '#262626',
                                                cursor: 'pointer',
                                            }}>
                                                <span>{country.phoneCode}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                noStyle
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    {
                                        pattern: /^\d{10}$/,
                                        message: 'Phone number must be exactly 10 digits'
                                    }
                                ]}
                            >
                                <Input
                                    size="large"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '46px',
                                        backgroundColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Location</span>}
                        rules={[{ required: true, message: 'Please enter location' }]}
                    >
                        <Input
                            placeholder="Enter location"
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
                        name="total_experience"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Total Experience</span>}
                        rules={[{ required: true, message: 'Please enter total experience' }]}
                    >
                        <Select
                            placeholder="Select total experience"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                height: '48px',
                            }}
                        >
                            {experienceLevels.map(level => (
                                <Option key={level} value={level}>{level}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="current_location"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Current Location</span>}
                        rules={[{ required: true, message: 'Please enter current location' }]}
                    >
                        <Input
                            placeholder="Enter current location"
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
                        name="notice_period"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Notice Period</span>}
                        rules={[{ required: true, message: 'Please enter notice period' }]}
                    >
                        <Input
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter notice period"
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
                        name="applied_source"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Applied Source</span>}
                        rules={[{ required: true, message: 'Please enter applied source' }]}
                    >
                        <Input
                            placeholder="Enter applied source"
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
                        name="cover_letter"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Cover Letter</span>}
                        rules={[{ required: true, message: 'Please enter cover letter' }]}
                    >
                        <Input
                            placeholder="Enter cover letter"
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
                        name="status"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Status</span>}
                        rules={[{ required: true, message: 'Please select status' }]}
                        initialValue="pending"
                    >
                        <Select
                            placeholder="Select status"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px'
                            }}
                        >
                            {statusOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                   
                                        {option.label}
                                    
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="cv_path"
                    label="Resume/CV"
                    rules={[{ required: true, message: 'Please upload your resume/CV' }]}
                    className="full-width"
                >
                    <Upload.Dragger
                        name="cv_path"
                        multiple={false}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".pdf,.doc,.docx"
                    >
                        <p className="ant-upload-drag-icon">
                            <FiUpload style={{ fontSize: '24px', color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload resume</p>
                        <p className="ant-upload-hint">
                            Support for PDF, DOC, DOCX files
                        </p>
                    </Upload.Dragger>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', gridColumn: '1 / -1' }}>
                    <Button
                        onClick={onCancel}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            border: '1px solid #e6e8eb',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                        }}
                        loading={isEditing ? isUpdating : isCreating}
                    >
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJobApplication; 