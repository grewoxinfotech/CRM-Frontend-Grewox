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
    FiUsers,
    FiMapPin,
    FiCalendar,
    FiClock,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { TextArea } = Input;

const CreateMeeting = ({
    open,
    onCancel,
    onSubmit,
    isEditing,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();

    // Define meeting types
    const meetingTypes = [
        { value: 'team_meeting', label: 'Team Meeting' },
        { value: 'client_meeting', label: 'Client Meeting' },
        { value: 'board_meeting', label: 'Board Meeting' },
        { value: 'project_meeting', label: 'Project Meeting' },
    ];

    // Define locations
    const locations = [
        { value: 'conference_room_1', label: 'Conference Room 1' },
        { value: 'conference_room_2', label: 'Conference Room 2' },
        { value: 'meeting_room_1', label: 'Meeting Room 1' },
        { value: 'virtual', label: 'Virtual Meeting' },
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
            className="meeting-form-modal"
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
                        <FiUsers style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Meeting' : 'Schedule New Meeting'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update meeting information'
                                : 'Fill in the information to schedule meeting'}
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
                                    Meeting Title
                                </span>
                            }
                            rules={[{ required: true, message: 'Please enter meeting title' }]}
                        >
                            <Input
                                prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter meeting title"
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
                            name="department"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Department
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select department' }]}
                        >
                            <Select
                                placeholder="Select department"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                options={[
                                    { value: 'hr', label: 'Human Resources' },
                                    { value: 'it', label: 'Information Technology' },
                                    { value: 'finance', label: 'Finance' },
                                    { value: 'marketing', label: 'Marketing' },
                                    { value: 'sales', label: 'Sales' },
                                    { value: 'operations', label: 'Operations' }
                                ]}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="employees"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Employees
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select employees' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select employees"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                options={[
                                    { value: 'john', label: 'John Smith' },
                                    { value: 'jane', label: 'Jane Doe' },
                                    { value: 'bob', label: 'Bob Wilson' },
                                    { value: 'alice', label: 'Alice Brown' }
                                ]}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="client"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Client
                                </span>
                            }
                        >
                            <Input
                                placeholder="Enter client name"
                                size="large"
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
                                    Meeting Date
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
                            name="startTime"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Start Time
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select start time' }]}
                        >
                            <TimePicker
                                placeholder="Select start time"
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
                    <Col span={12}>
                        <Form.Item
                            name="endTime"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    End Time
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select end time' }]}
                        >
                            <TimePicker
                                placeholder="Select end time"
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
                                placeholder="Select status"
                                size="large"
                                options={[
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' }
                                ]}
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="meetingLink"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Meeting Link
                                </span>
                            }
                        >
                            <Input
                                placeholder="Enter meeting link"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="notes"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Meeting Notes
                        </span>
                    }
                >
                    <TextArea
                        placeholder="Enter meeting notes"
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
                        {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateMeeting;