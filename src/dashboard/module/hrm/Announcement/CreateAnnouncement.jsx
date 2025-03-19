import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    Row,
    Col,
    DatePicker,
    TimePicker,
} from 'antd';
import {
    FiX,
    FiFileText,
    FiAlertCircle,
    FiUser,
    FiCalendar,
    FiClock,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { TextArea } = Input;

const CreateAnnouncement = ({
    open,
    onCancel,
    onSubmit,
    isEditing,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();

    // Define branches array
    const branches = [
        { value: 'head_office', label: 'Head Office' },
        { value: 'branch_1', label: 'Branch 1' },
        { value: 'branch_2', label: 'Branch 2' },
        { value: 'branch_3', label: 'Branch 3' },
    ];

    useEffect(() => {
        if (initialValues) {
            const formattedValues = {
                ...initialValues,
                date: initialValues.date ? dayjs(initialValues.date) : null,
                time: initialValues.time ? dayjs(initialValues.time, 'HH:mm') : null,
            };
            form.setFieldsValue(formattedValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                date: values.date ? values.date.format('YYYY-MM-DD') : null,
                time: values.time ? values.time.format('HH:mm') : null,
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
            className="announcement-form-modal"
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
                        <FiFileText style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update announcement information'
                                : 'Fill in the information to create announcement'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="title"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Title
                                </span>
                            }
                            rules={[{ required: true, message: 'Please enter announcement title' }]}
                        >
                            <Input
                                prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter announcement title"
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
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="branch"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Branch
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select branch' }]}
                        >
                            <Select
                                placeholder="Select branch"
                                options={branches}
                                size="large"
                                suffixIcon={<FiAlertCircle style={{ color: '#1890ff', fontSize: '16px' }} />}
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Date
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker
                                placeholder="Select date"
                                size="large"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                                format="DD-MM-YYYY"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="time"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Time
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select time' }]}
                        >
                            <TimePicker
                                placeholder="Select time"
                                size="large"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                                format="HH:mm"
                            />
                        </Form.Item>
                    </Col>
                </Row>

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
                        placeholder="Enter announcement description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                            resize: 'none',
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
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isEditing ? 'Update Announcement' : 'Create Announcement'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateAnnouncement; 