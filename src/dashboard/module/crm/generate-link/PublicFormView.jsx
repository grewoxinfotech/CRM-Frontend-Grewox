import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Switch, InputNumber, message, Spin, Space, Select, Checkbox, Radio } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomFormByIdQuery, useSubmitFormResponseMutation } from './services/customFormApi';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiFileText,
    FiCalendar,
    FiToggleRight,
    FiHash,
    FiMapPin,
    FiList,
    FiCheck,
    FiMessageSquare,
    FiBookmark,
    FiGrid,
    FiLayers,
    FiClock,
    FiAlertCircle
} from 'react-icons/fi';
import dayjs from 'dayjs';
import './PublicForm.scss';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FormExpired = () => (
    <div className="form-status-container">
        <div className="status-icon">
            <FiAlertCircle />
        </div>
        <Title level={2}>Form Has Expired</Title>
        <Text>This form is no longer accepting responses.</Text>
        <Text type="secondary">Please contact the organizer for more information.</Text>
    </div>
);

const FormCountdown = ({ startDate }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = dayjs();
            const start = dayjs(startDate);
            const diff = start.diff(now);

            if (diff <= 0) {
                return null;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [startDate]);

    if (!timeLeft) return null;

    return (
        <div className="form-status-container upcoming">
            <div className="status-icon">
                <FiClock />
            </div>
            <Title level={2}>Registration Opens Soon</Title>
            <div className="countdown-timer">
                <div className="countdown-item">
                    <span className="number">{timeLeft.days}</span>
                    <span className="label">Days</span>
                </div>
                <div className="countdown-item">
                    <span className="number">{timeLeft.hours}</span>
                    <span className="label">Hours</span>
                </div>
                <div className="countdown-item">
                    <span className="number">{timeLeft.minutes}</span>
                    <span className="label">Minutes</span>
                </div>
                <div className="countdown-item">
                    <span className="number">{timeLeft.seconds}</span>
                    <span className="label">Seconds</span>
                </div>
            </div>
            <Text>The registration will open on {dayjs(startDate).format('MMM DD, YYYY [at] hh:mm A')}</Text>
        </div>
    );
};

const PublicFormView = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: formData, isLoading, error } = useGetCustomFormByIdQuery(formId);
    const [submitFormResponse, { isLoading: isSubmitting }] = useSubmitFormResponseMutation();
    const [fields, setFields] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [checkboxStates, setCheckboxStates] = useState({});

    // Initialize checkbox states
    useEffect(() => {
        if (formData?.data) {
            try {
                const parsedFields = typeof formData.data.fields === 'string'
                    ? JSON.parse(formData.data.fields)
                    : formData.data.fields;
                setFields(parsedFields);

                // Initialize checkbox states
                const initialCheckboxStates = {};
                Object.entries(parsedFields).forEach(([fieldName, field]) => {
                    if (field.type === 'checkbox' && field.options) {
                        initialCheckboxStates[fieldName] = {};
                        field.options.forEach(option => {
                            initialCheckboxStates[fieldName][option] = false;
                        });
                    }
                });
                setCheckboxStates(initialCheckboxStates);
                form.setFieldsValue(initialCheckboxStates);
            } catch (error) {
                console.error('Error parsing fields:', error);
                message.error('Error loading form fields');
            }
        }
    }, [formData, form]);

    const handleCheckboxChange = (fieldName, option, checked) => {
        setCheckboxStates(prev => {
            const newState = {
                ...prev,
                [fieldName]: {
                    ...prev[fieldName],
                    [option]: checked
                }
            };

            // Update form values
            form.setFieldsValue({
                [fieldName]: newState[fieldName]
            });

            return newState;
        });
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const submissionData = { ...values };

            // Ensure checkbox values are included
            Object.entries(checkboxStates).forEach(([fieldName, fieldValue]) => {
                submissionData[fieldName] = fieldValue;
            });

            const response = await submitFormResponse({
                formId,
                data: { submission_data: submissionData }
            }).unwrap();

            if (response.success) {
                message.success('Form submitted successfully');
                form.resetFields();
                setCheckboxStates({});
            }
        } catch (error) {
            console.error('Form submission error:', error);
            message.error(error.data?.message || 'Failed to submit form');
        } finally {
            setSubmitting(false);
        }
    };

    // Add form validation debugging
    const onFieldsChange = (changedFields, allFields) => {
        console.log('Field changed:', changedFields);
        console.log('Current form values:', form.getFieldsValue());
    };

    if (isLoading) {
        return (
            <div className="public-form-loading">
                <Spin size="large" />
                <Text>Loading form...</Text>
            </div>
        );
    }

    if (error?.error?.code === 'BAD_REQUEST' && error?.error?.message === 'Form has expired') {
        return <FormExpired />;
    }

    if (error) {
        return (
            <div className="public-form-error">
                <Title level={3}>Unable to load form</Title>
                <Text type="secondary">Please try again later or contact support.</Text>
            </div>
        );
    }

    const now = dayjs();
    const startDate = dayjs(formData?.data?.start_date);
    const endDate = dayjs(formData?.data?.end_date);

    if (now.isBefore(startDate)) {
        return <FormCountdown startDate={startDate} />;
    }

    if (now.isAfter(endDate)) {
        return <FormExpired />;
    }

    const getFieldPrefix = (type) => {
        const iconProps = { className: 'field-icon' };
        switch (type) {
            case 'text':
            case 'name':
                return <FiUser {...iconProps} />;
            case 'message':
                return <FiMessageSquare {...iconProps} />;
            case 'email':
                return <FiMail {...iconProps} />;
            case 'phone':
                return <FiPhone {...iconProps} />;
            case 'select':
            case 'multiselect':
                return <FiGrid {...iconProps} />;
            case 'checkbox':
            case 'radio':
                return <FiLayers {...iconProps} />;
            case 'file':
                return <FiFileText {...iconProps} />;
            case 'boolean':
                return <FiToggleRight {...iconProps} />;
            default:
                return <FiBookmark {...iconProps} />;
        }
    };

    const renderField = (fieldName, field) => {
        const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');

        const commonProps = {
            key: fieldName,
            name: fieldName,
            label: label,
            rules: [{ required: field.required, message: `Please enter ${label}` }],
            className: 'custom-form-item'
        };

        switch (field.type) {
            case 'text':
            case 'name':
                return (
                    <Form.Item {...commonProps}>
                        <Input
                            className="custom-input"
                            placeholder={`Enter ${label.toLowerCase()}`}
                            prefix={getFieldPrefix(field.type)}
                        />
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item {...commonProps}>
                        <InputNumber
                            className="custom-input"
                            style={{ width: '100%' }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            prefix={<FiHash className="field-icon" />}
                            min={field.validation?.min}
                            max={field.validation?.max}
                        />
                    </Form.Item>
                );
            case 'textarea':
                return (
                    <Form.Item {...commonProps}>
                        <Input.TextArea
                            className="custom-textarea"
                            rows={4}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            prefix={<FiMessageSquare className="field-icon" />}
                        />
                    </Form.Item>
                );
            case 'email':
                return (
                    <Form.Item {...commonProps} rules={[...commonProps.rules, { type: 'email', message: 'Please enter a valid email' }]}>
                        <Input
                            className="custom-input"
                            placeholder="Enter email address"
                            prefix={getFieldPrefix('email')}
                        />
                    </Form.Item>
                );
            case 'phone':
                return (
                    <Form.Item {...commonProps}>
                        <Input
                            className="custom-input"
                            placeholder="Enter phone number"
                            prefix={getFieldPrefix('phone')}
                        />
                    </Form.Item>
                );
            case 'select':
                return (
                    <Form.Item {...commonProps}>
                        <Select
                            className="custom-select"
                            placeholder={`Select ${label.toLowerCase()}`}
                            suffixIcon={getFieldPrefix('select')}
                            options={field.options?.map(option => ({
                                label: option,
                                value: option
                            }))}
                        />
                    </Form.Item>
                );
            case 'multiselect':
                return (
                    <Form.Item {...commonProps}>
                        <Select
                            mode="multiple"
                            className="custom-select"
                            placeholder={`Select ${label.toLowerCase()}`}
                            suffixIcon={getFieldPrefix('multiselect')}
                            options={field.options?.map(option => ({
                                label: option,
                                value: option
                            }))}
                        />
                    </Form.Item>
                );
            case 'checkbox':
                return (
                    <Form.Item {...commonProps}>
                        <div className="checkbox-group-wrapper">
                            {getFieldPrefix('checkbox')}
                            <div className="custom-checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {field.options?.map((option) => (
                                    <Checkbox
                                        key={option}
                                        checked={checkboxStates[fieldName]?.[option] || false}
                                        onChange={(e) => handleCheckboxChange(fieldName, option, e.target.checked)}
                                    >
                                        {option}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                    </Form.Item>
                );
            case 'radio':
                return (
                    <Form.Item {...commonProps}>
                        <div className="radio-group-wrapper">
                            {getFieldPrefix('radio')}
                            <Radio.Group className="custom-radio-group">
                                {field.options?.map(option => (
                                    <Radio key={option} value={option}>{option}</Radio>
                                ))}
                            </Radio.Group>
                        </div>
                    </Form.Item>
                );
            case 'boolean':
                return (
                    <Form.Item {...commonProps} valuePropName="checked">
                        <Switch className="custom-switch" />
                    </Form.Item>
                );
            default:
                return null;
        }
    };

    return (
        <div className="public-form-container">
            <div className="form-header">
                <div className="header-content">
                    <div className="header-main">
                        <div className="header-text">
                            <Title level={2}>{formData?.data?.title}</Title>
                            <Paragraph>{formData?.data?.description}</Paragraph>
                        </div>
                    </div>

                    <div className="event-info">
                        <div className="event-card">
                            <div className="event-card-item">
                                <FiCalendar className="icon" />
                                <div className="info">
                                    <Text className="label">Event Date</Text>
                                    <Text className="value">
                                        {dayjs(formData?.data?.start_date).format('MMM DD, YYYY')}
                                    </Text>
                                </div>
                            </div>
                            <div className="event-card-item">
                                <FiMapPin className="icon" />
                                <div className="info">
                                    <Text className="label">Location</Text>
                                    <Text className="value">{formData?.data?.event_location}</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onFieldsChange={onFieldsChange}
                    className="custom-form"
                    validateTrigger={['onBlur', 'onChange']}
                >
                    {Object.entries(fields).map(([fieldName, field]) =>
                        renderField(fieldName, field)
                    )}

                    <Form.Item className="form-submit">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PublicFormView; 