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
import { useCreateDemoRequestMutation, useUpdateDemoRequestMutation } from './services/demoRequestApi';
import moment from "moment";
import {
    FiX,
    FiCalendar,
    FiUser,
    FiMail,
    FiPhone,
    FiBriefcase,
    FiUsers,
    FiGrid,
    FiCheckSquare,
    FiFileText
} from 'react-icons/fi';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const CreateDemoRequestModal = ({ 
    open, 
    onCancel, 
    onSubmit, 
    isEditing, 
    initialValues = {}
}) => {
    const [form] = Form.useForm();
    const [createDemoRequest] = useCreateDemoRequestMutation();
    const [updateDemoRequest] = useUpdateDemoRequestMutation();

    React.useEffect(() => {
        if (open) {
            if (isEditing && initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    preferredTime: initialValues.preferredTime ? moment(initialValues.preferredTime) : null
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, isEditing, initialValues, form]);

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
    };

    const onFinish = async (values) => {
        try {
            const formattedValues = {
                fullName: values.fullName,
                mobileNumber: values.mobileNumber,
                businessName: values.businessName,
                email: values.email || null,
                businessType: values.businessType || null,
                teamSize: values.teamSize || null,
                requirements: values.requirements || null,
                preferredTime: values.preferredTime ? values.preferredTime.toISOString() : null,
                notes: values.notes || null,
                status: values.status || "pending"
            };

            if (isEditing) {
                await updateDemoRequest({
                    id: initialValues.id,
                    ...formattedValues
                }).unwrap();
                message.success("Demo request updated successfully");
            } else {
                await createDemoRequest(formattedValues).unwrap();
                message.success("Demo request created successfully");
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
            width={580}
            destroyOnClose={true}
            centered
            closeIcon={null}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: "16px",
                    overflow: "hidden",
                },
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
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
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiCalendar style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2 style={{ margin: "0", fontSize: "22px", fontWeight: "700", color: "#ffffff" }}>
                            {isEditing ? "Schedule & Edit Demo" : "Request a Demo"}
                        </h2>
                        <Text style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.85)" }}>
                            {isEditing ? "Update scheduling, notes, and information" : "Fill in the details to schedule a premium business demo"}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                style={{ padding: "24px" }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="fullName"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Full Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        rules={[{ required: true, message: "Please input full name!" }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: "#2563eb", fontSize: "15px" }} />}
                            placeholder="Full name"
                            size="large"
                            style={{ borderRadius: "10px" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="mobileNumber"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Mobile Number <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        rules={[{ required: true, message: "Please input mobile number!" }]}
                    >
                        <Input
                            prefix={<FiPhone style={{ color: "#2563eb", fontSize: "15px" }} />}
                            placeholder="Mobile number"
                            size="large"
                            style={{ borderRadius: "10px" }}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "8px" }}>
                    <Form.Item
                        name="businessName"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Business Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        rules={[{ required: true, message: "Please input business name!" }]}
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: "#2563eb", fontSize: "15px" }} />}
                            placeholder="Business name"
                            size="large"
                            style={{ borderRadius: "10px" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Email ID <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "400" }}>(Optional)</span></span>}
                    >
                        <Input
                            prefix={<FiMail style={{ color: "#2563eb", fontSize: "15px" }} />}
                            placeholder="Email address"
                            size="large"
                            style={{ borderRadius: "10px" }}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "8px" }}>
                    <Form.Item
                        name="businessType"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Business / Industry</span>}
                    >
                        <Select
                            placeholder="Select Industry"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="Real Estate">Real Estate</Option>
                            <Option value="Education">Education</Option>
                            <Option value="Marketing Agency">Marketing Agency</Option>
                            <Option value="Manufacturing">Manufacturing</Option>
                            <Option value="Healthcare">Healthcare</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="teamSize"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Team Size / Employees</span>}
                    >
                        <Select
                            placeholder="Select Team Size"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="1-5">1-5 Employees</Option>
                            <Option value="5-20">5-20 Employees</Option>
                            <Option value="20-50">20-50 Employees</Option>
                            <Option value="50+">50+ Employees</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="requirements"
                    label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>What are you looking for?</span>}
                    style={{ marginTop: "8px" }}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select Requirements"
                        size="large"
                        style={{ width: '100%' }}
                        dropdownStyle={{ borderRadius: '10px' }}
                        allowClear
                    >
                        <Option value="Lead Management">Lead Management</Option>
                        <Option value="WhatsApp Automation">WhatsApp Automation</Option>
                        <Option value="Sales CRM">Sales CRM</Option>
                        <Option value="Employee Management">Employee Management</Option>
                        <Option value="Marketing Automation">Marketing Automation</Option>
                        <Option value="Full Business CRM">Full Business CRM</Option>
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "8px" }}>
                    <Form.Item
                        name="preferredTime"
                        label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Preferred Demo Date & Time</span>}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Select Preferred Time"
                            size="large"
                            style={{ width: '100%', borderRadius: "10px" }}
                        />
                    </Form.Item>

                    {isEditing && (
                        <Form.Item
                            name="status"
                            label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Request Status</span>}
                        >
                            <Select
                                size="large"
                                style={{ width: '100%' }}
                                dropdownStyle={{ borderRadius: '10px' }}
                            >
                                <Option value="pending">Pending</Option>
                                <Option value="scheduled">Scheduled</Option>
                                <Option value="completed">Completed</Option>
                                <Option value="cancelled">Cancelled</Option>
                            </Select>
                        </Form.Item>
                    )}
                </div>

                <Form.Item
                    name="notes"
                    label={<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#475569" }}>Action Logs / Notes</span>}
                    style={{ marginTop: "8px" }}
                >
                    <TextArea
                        rows={3}
                        placeholder="Add superadmin follow-up notes or action logs here..."
                        style={{ borderRadius: "10px" }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <Button
                            onClick={handleCancel}
                            size="large"
                            style={{ borderRadius: "10px", height: "40px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{
                                borderRadius: "10px",
                                height: "40px",
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                border: "none",
                            }}
                        >
                            {isEditing ? "Save Changes" : "Submit Request"}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateDemoRequestModal;
