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
    Upload
} from 'antd';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiDollarSign, FiX, FiClock, FiUpload } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

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

const CreateJobApplication = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                const formattedValues = {
                    ...initialValues,
                    interview_date: initialValues.interview_date ? dayjs(initialValues.interview_date) : undefined,
                    interview_time: initialValues.interview_time ? dayjs(initialValues.interview_time, 'HH:mm A') : undefined
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
                interview_date: values.interview_date ? values.interview_date.format('YYYY-MM-DD') : undefined,
                interview_time: values.interview_time ? values.interview_time.format('HH:mm A') : undefined
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
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job</span>}
                        rules={[{ required: true, message: 'Please enter job' }]}
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter job"
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
                        name="phone"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Phone</span>}
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', gridColumn: '1 / -1' }}>
                        <Button
                            onClick={() => setIsModalVisible(false)}
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
                        >
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJobApplication; 