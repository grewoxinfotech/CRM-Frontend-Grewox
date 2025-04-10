import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Switch, InputNumber, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetCustomFormByIdQuery } from './services/customFormApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PublicFormView = () => {
    const { formId } = useParams();
    const [form] = Form.useForm();
    const { data: formData, isLoading, error } = useGetCustomFormByIdQuery(formId);

    const [fields, setFields] = useState({});

    useEffect(() => {
        if (formData?.data) {
            try {
                const parsedFields = typeof formData.data.fields === 'string'
                    ? JSON.parse(formData.data.fields)
                    : formData.data.fields;
                setFields(parsedFields);
            } catch (error) {
                console.error('Error parsing fields:', error);
                message.error('Error loading form fields');
            }
        }
    }, [formData]);

    const renderField = (fieldName, field) => {
        const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');

        switch (field.type) {
            case 'string':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={label}
                        rules={[{ required: field.required, message: `Please enter ${label}` }]}
                    >
                        <Input />
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={label}
                        rules={[{ required: field.required, message: `Please enter ${label}` }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                );
            case 'text':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={label}
                        rules={[{ required: field.required, message: `Please enter ${label}` }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                );
            case 'boolean':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={label}
                        valuePropName="checked"
                        rules={[{ required: field.required, message: `Please select ${label}` }]}
                    >
                        <Switch />
                    </Form.Item>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async (values) => {
        try {
            // TODO: Add API call to submit form response
            console.log('Form values:', values);
            message.success('Form submitted successfully');
            form.resetFields();
        } catch (error) {
            message.error('Failed to submit form');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading form</div>;
    }

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
            <Card>
                <Title level={2}>{formData?.data?.title}</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    {formData?.data?.description}
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {Object.entries(fields).map(([fieldName, field]) =>
                        renderField(fieldName, field)
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PublicFormView; 