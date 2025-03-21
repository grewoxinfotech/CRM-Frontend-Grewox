import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    Typography,
    DatePicker
} from 'antd';
import {
    FiUser,
    FiBriefcase,
    FiMapPin,
    FiCalendar,
    FiClock,
    FiX,
    FiMessageSquare
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const interviewTypes = [
    { value: 'technical', label: 'Technical' },
    { value: 'hr', label: 'HR' },
    { value: 'culture_fit', label: 'Culture Fit' },
    { value: 'final', label: 'Final' }
];

const statuses = [
    { value: 'Online', label: 'Online' },
    { value: 'Offline', label: 'Offline' }
];

const CreateInterview = ({ open, onCancel, onSubmit, selectedDate }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && selectedDate) {
            form.setFieldsValue({
                date: selectedDate,
            });
        }
    }, [open, selectedDate, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                start_time: values.start_time?.format('HH:mm'),
                start_date: values.start_date?.format('YYYY-MM-DD'),
                interviewer_comments: values.interviewer_comments?.trim(),
                candidate_comments: values.candidate_comments?.trim()
            };

            if (!formattedValues.start_date || !formattedValues.start_time) {
                throw new Error('Start date and time are required');
            }

            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            if (error.errorFields) {
                // Form validation error
                console.error('Form validation failed:', error.errorFields);
            } else {
                // Other errors
                console.error('Error submitting form:', error.message);
            }
        }
    };

    // Update the date validation in your form
    const validateDates = async (_, value) => {
        if (value && form.getFieldValue('start_date')) {
            if (!dayjs(value).isSameOrAfter(form.getFieldValue('start_date'))) {
                throw new Error('End date must be after start date');
            }
        }
        return Promise.resolve();
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
                        <FiCalendar style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Schedule Interview
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Schedule an interview for {selectedDate?.format('MMMM D, YYYY')}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="job"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job</span>}
                        rules={[{ required: true, message: 'Please select job' }]}
                    >
                        <Select
                            placeholder="Select job"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            <Option value="job1">Job 1</Option>
                            <Option value="job2">Job 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="candidate"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Candidate</span>}
                        rules={[{ required: true, message: 'Please select candidate' }]}
                    >
                        <Select
                            placeholder="Select candidate" 
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            <Option value="candidate1">Candidate 1</Option>
                            <Option value="candidate2">Candidate 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="interviewer"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Interviewer</span>}
                        rules={[{ required: true, message: 'Please select interviewer' }]}
                    >
                        <Select
                            placeholder="Select interviewer"
                            size="large" 
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            <Option value="interviewer1">Interviewer 1</Option>
                            <Option value="interviewer2">Interviewer 2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="round"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Interview Round</span>}
                        rules={[{ required: true, message: 'Please select round' }]}
                    >
                        <Select
                            placeholder="Select round"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            <Option value="round1">Round 1</Option>
                            <Option value="round2">Round 2</Option>
                            <Option value="round3">Round 3</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="interview_type"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Interview Type</span>}
                        rules={[{ required: true, message: 'Please select interview type' }]}
                    >
                        <Select
                            placeholder="Select interview type"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            <Option value="online">Online</Option>
                            <Option value="offline">Offline</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="start_date"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Start On</span>}
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="DD-MM-YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        name="start_time"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Start Time</span>}
                        rules={[{ required: true, message: 'Please select time' }]}
                    >
                        <TimePicker
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="HH:mm"
                        />
                    </Form.Item>

                    <Form.Item
                        name="interviewer_comments"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Comments for Interviewer</span>}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <TextArea
                            placeholder="Enter comments for interviewer"
                            rows={4}
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="candidate_comments" 
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Comments for Candidate</span>}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <TextArea
                            placeholder="Enter comments for candidate"
                            rows={4}
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                        />
                    </Form.Item>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px'
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
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
                        Schedule Interview
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateInterview; 