import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    Space,
    message,
} from 'antd';
import { FiUser, FiFileText, FiGrid, FiX, FiCalendar, FiLink, FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import moment from 'moment';
import { useCreateTrainingMutation, useUpdateTrainingMutation } from './services/trainingApi';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CreateTraining = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // RTK Query hooks
    const [createTraining] = useCreateTrainingMutation();
    const [updateTraining] = useUpdateTrainingMutation();

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url.startsWith('www.') ? url : `www.${url}`}`;
    };

    const validateUrl = (_, value) => {
        if (!value) {
            return Promise.reject('Please enter URL');
        }
        try {
            const formattedUrl = formatUrl(value);
            new URL(formattedUrl);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject('Please enter a valid URL');
        }
    };

    useEffect(() => {
        if (isEditing && initialValues) {
            try {
                const links = typeof initialValues.links === 'string'
                    ? JSON.parse(initialValues.links)
                    : initialValues.links;

                form.setFieldsValue({
                    category: initialValues.category,
                    title: initialValues.title,
                    trainingItems: links.titles.map((title, index) => ({
                        title: title,
                        url: links.urls[index]
                    }))
                });
            } catch (error) {
                console.error('Error setting form values:', error);
                message.error('Error loading training data');
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                trainingItems: [{ title: '', url: '' }]
            });
        }
    }, [initialValues, isEditing, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formattedLinks = {
                titles: values.trainingItems.map(item => item.title.trim()),
                urls: values.trainingItems.map(item => formatUrl(item.url.trim()))
            };

            const formData = {
                category: values.category.trim(),
                title: values.title.trim(),
                links: formattedLinks
            };

            if (isEditing && initialValues?.id) {
                await updateTraining({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Training updated successfully!');
            } else {
                await createTraining(formData).unwrap();
                message.success('Training created successfully!');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error(error?.data?.message || 'Error processing your request');
        } finally {
            setLoading(false);
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
            className="training-form-modal"
            style={{
                "--antd-arrow-background-color": "#ffffff",
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: "8px",
                    overflow: "hidden",
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiUsers style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                            }}
                        >
                            {isEditing ? "Edit Training" : "Create New Training"}
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Fill in the information to {isEditing ? "update" : "create"} training
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ trainingItems: [{ title: '', url: '' }] }}
                style={{
                    padding: "24px",
                }}
            >
                <Form.Item
                    name="title"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Training Title <span style={{ color: "#ff4d4f" }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter training title' }]}
                >
                    <Input
                        prefix={<FiFileText style={{ color: '#1890ff' }} />}
                        placeholder="Enter training title"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                            height: "48px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="category"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Category <span style={{ color: "#ff4d4f" }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter category' }]}
                >
                    <Input
                        prefix={<FiGrid style={{ color: '#1890ff' }} />}
                        placeholder="Enter Training Category"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                            height: "48px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                        }}
                    />
                </Form.Item>

                <Divider orientation="left">Training Links</Divider>

                <Form.List name="trainingItems">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'title']}
                                        rules={[{ required: true, message: 'Missing title' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input
                                            placeholder="Link title"
                                            size="large"
                                            style={{
                                                borderRadius: "10px",
                                                backgroundColor: "#f8fafc",
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'url']}
                                        rules={[
                                            { required: true, message: 'Missing URL' },
                                            { validator: validateUrl }
                                        ]}
                                        style={{ flex: 2 }}
                                    >
                                        <Input
                                            placeholder="Link URL (e.g., www.github.com)"
                                            size="large"
                                            style={{
                                                borderRadius: "10px",
                                                backgroundColor: "#f8fafc",
                                            }}
                                            onBlur={(e) => {
                                                const fieldValue = form.getFieldValue(['trainingItems', name, 'url']);
                                                if (fieldValue) {
                                                    form.setFieldValue(
                                                        ['trainingItems', name, 'url'],
                                                        formatUrl(fieldValue)
                                                    );
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                    {fields.length > 1 && (
                                        <Button
                                            type="text"
                                            onClick={() => remove(name)}
                                            icon={<FiTrash2 />}
                                            style={{
                                                color: "#ff4d4f",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    )}
                                </Space>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<FiPlus />}
                                    style={{
                                        borderRadius: "10px",
                                        height: "44px",
                                    }}
                                >
                                    Add Training Link
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Divider style={{ margin: "24px 0" }} />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: "8px 24px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e6e8eb",
                            fontWeight: "500",
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
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                        }}
                    >
                        {isEditing ? 'Update Training' : 'Create Training'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTraining;
