import React from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    message,
    Select,
    DatePicker,
    Typography,
} from "antd";
import { useCreateInquiryMutation, useUpdateInquiryMutation } from './services/inquaryApi';
import { useGetAllCountriesQuery } from '../settings/services/settingsApi';
import moment from "moment";
import {
    FiX,
    FiMessageSquare,
    FiUser,
    FiMail,
    FiPhone,
    FiBookmark,
    FiMessageCircle
} from 'react-icons/fi';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const CreateInquaryModal = ({ open, onCancel, onSubmit, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createInquiry] = useCreateInquiryMutation();
    const [updateInquiry] = useUpdateInquiryMutation();
    const { data: countries = [], isLoading: countriesLoading } = useGetAllCountriesQuery();

    // Set form values when editing
    React.useEffect(() => {
        if (initialValues) {
            // Find the phone code from country ID
            const country = countries?.find(c => c.id === initialValues.phonecode);
            const phoneCode = country?.phoneCode || '+91';

            form.setFieldsValue({
                ...initialValues,
                phonecode: phoneCode // Set the phone code instead of ID
            });
        } else {
            form.resetFields();
        }
    }, [initialValues, form, countries]);

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
    };

    const onFinish = async (values) => {
        try {
            // Find the country ID from the selected phone code
            const selectedCountry = countries?.find(c => c.phoneCode === values.phonecode);
            if (!selectedCountry) {
                message.error('Please select a valid phone code');
                return;
            }

            const formattedValues = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                phonecode: selectedCountry.id, // Use country ID as phonecode
                subject: values.subject,
                message: values.message
            };

            if (isEditing) {
                await updateInquiry({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success("Inquiry updated successfully");
            } else {
                await createInquiry(formattedValues).unwrap();
                message.success("Inquiry created successfully");
            }

            handleCancel();
            onSubmit?.();
        } catch (error) {
            console.error("Operation failed:", error);
            message.error(error?.data?.message || "Operation failed");
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
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
                },
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
                    onClick={handleCancel}
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
                        <FiMessageSquare style={{ fontSize: "24px", color: "#ffffff" }} />
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
                            {isEditing ? "Edit Inquiry" : "Create New Inquiry"}
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            {isEditing
                                ? "Update inquiry information"
                                : "Fill in the information to create inquiry"}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                style={{
                    padding: "24px",
                }}
            >
                <Form.Item
                    name="name"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Name {!isEditing && <span style={{ color: "#ff4d4f" }}>*</span>}
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the name!",
                        },
                        {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                                return Promise.reject(
                                    new Error('Name must contain both uppercase or lowercase English letters')
                                );
                            }
                            return Promise.resolve();
                            }
                          }
                    ]}
                >
                    <Input
                        prefix={<FiUser style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter name"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Email {!isEditing && <span style={{ color: "#ff4d4f" }}>*</span>}
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            type: "email",
                            message: "Please input a valid email!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiMail style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter email"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Phone Number {!isEditing && <span style={{ color: "#ff4d4f" }}>*</span>}
                        </span>
                    }
                    required
                    className="combined-input-item"
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
                            name="phonecode"
                            noStyle
                            rules={[{ required: true, message: 'Required' }]}
                            initialValue="+91"
                        >
                            <Select
                                size="large"
                                style={{
                                    width: '120px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                }}
                                loading={countriesLoading}
                                className="phone-code-select blue-gradient-select"
                                dropdownStyle={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    backgroundColor: 'white',
                                }}
                                showSearch
                                optionFilterProp="children"
                                defaultValue="+91"
                            >
                                {countries?.map(country => (
                                    <Option 
                                        key={country.id} 
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
                                            <span>{country.countryCode} {country.phoneCode}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            noStyle
                            rules={[
                                { required: true, message: 'Please enter phone number' }
                            ]}
                        >
                            <Input
                                size="large"
                                type="number"
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
                                placeholder="Enter phone number"
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>

                <Form.Item
                    name="subject"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Subject {!isEditing && <span style={{ color: "#ff4d4f" }}>*</span>}
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the subject!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiBookmark style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter subject"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="message"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Message {!isEditing && <span style={{ color: "#ff4d4f" }}>*</span>}
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the message!",
                        },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter message"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item className="form-actions" style={{ marginBottom: 0, marginTop: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <Button
                            onClick={handleCancel}
                            size="large"
                            style={{
                                borderRadius: "10px",
                                padding: "6px 20px",
                                height: "40px",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{
                                borderRadius: "10px",
                                padding: "6px 20px",
                                height: "40px",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                            }}
                        >
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateInquaryModal; 