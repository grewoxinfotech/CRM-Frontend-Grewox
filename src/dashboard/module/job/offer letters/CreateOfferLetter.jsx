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
    InputNumber,
    Upload,
    Row,
    Col,
    Card
} from 'antd';
import {
    FiUser,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiX,
    FiUpload,
    FiMail,
    FiFileText,
    FiMapPin
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import isValid from 'dayjs/plugin/isValid';
import TextArea from 'antd/es/input/TextArea';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
// dayjs.extend(isValid);

const { Text } = Typography;
const { Option } = Select;

const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support'
];

const statuses = [
    'pending',
    'accepted',
    'rejected',
    'expired'
];

const CreateOfferLetter = ({ open, onCancel, onSubmit, editData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (editData) {
                const formattedValues = {
                    ...editData,
                    offer_expiry: editData.offer_expiry ? dayjs(editData.offer_expiry) : undefined,
                    expected_joining_date: editData.expected_joining_date ? dayjs(editData.expected_joining_date) : undefined,
                };
                form.setFieldsValue(formattedValues);
            }
        }
    }, [open, form, editData]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                offer_expiry: values.offer_expiry?.format('YYYY-MM-DD'),
                expected_joining_date: values.expected_joining_date?.format('YYYY-MM-DD'),
            };
            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const validateDate = (_, value) => {
        if (!value) {
            return Promise.reject('Please select a date');
        }
        if (!dayjs.isDayjs(value)) {
            return Promise.reject('Invalid date format');
        }
        return Promise.resolve();
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
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
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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
                        <FiBriefcase style={{ fontSize: "24px", color: "#ffffff" }} />
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
                            {editData ? "Edit Offer Letter" : "Create New Offer Letter"}
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            {editData ? "Update offer letter information" : "Fill in the information to create offer letter"}
                        </Text>
                    </div>
                </div>
            </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                initialValues={editData}
                requiredMark={false}
                style={{
                    padding: "24px",
                }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Form.Item
                                name="job"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Job
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please enter job title' }]}
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
                                name="job_application"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Job Application
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please enter job application' }]}
                            >
                                <Input
                                    prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    placeholder="Enter job application"
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
                                name="offer_expiry"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Offer Expire On
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Please select expiry date' },
                                    { validator: validateDate }
                                ]}
                            >
                                <DatePicker
                                    size="large"
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        height: '48px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                    }}
                                    format="YYYY-MM-DD"
                                    placeholder="Select expiry date"
                                />
                            </Form.Item>

                            <Form.Item
                                name="expected_joining_date"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Expected Joining Date
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Please select joining date' },
                                    { validator: validateDate }
                                ]}
                            >
                                <DatePicker
                                    size="large"
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        height: '48px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                    }}
                                    format="YYYY-MM-DD"
                                    placeholder="Select joining date"
                                />
                            </Form.Item>

                            <Form.Item
                                name="salary"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Salary
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please enter salary' }]}
                            >
                                <Input
                                    prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    placeholder="Enter salary"
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
                                name="rate"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Rate
                                    </span>
                                }

                                rules={[{ required: true, message: 'Please enter rate' }]}
                            >
                                <Input
                                    prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    placeholder="Enter rate"
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
                        </div>

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
                                placeholder="Enter detailed description"
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
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "24px",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="large"
                                type="primary"
                        htmlType="submit"
                                style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {editData ? "Update Offer Letter" : "Create Offer Letter"}
                            </Button>
                        </div>
            </Form>
        </Modal>
    );
};

export default CreateOfferLetter;
