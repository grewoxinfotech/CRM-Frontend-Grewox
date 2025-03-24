import React, { useState } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    message,
    Select,
    DatePicker,
} from "antd";
import { useCreateInquiryMutation, useUpdateInquiryMutation } from './services/inquaryApi';
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;

const CreateInquary = ({ isModalVisible, setIsModalVisible, selectedInquiry, setSelectedInquiry }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // RTK Query mutations
    const [createInquiry] = useCreateInquiryMutation();
    const [updateInquiry] = useUpdateInquiryMutation();

    // Set form values when editing
    React.useEffect(() => {
        if (selectedInquiry) {
            form.setFieldsValue({
                ...selectedInquiry,
                date: moment(selectedInquiry.date),
            });
        }
    }, [selectedInquiry, form]);

    const handleCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
        setSelectedInquiry(null);
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const formattedValues = {
                ...values,
                date: values.date.format("YYYY-MM-DD"),
            };

            if (selectedInquiry) {
                await updateInquiry({
                    id: selectedInquiry.id,
                    data: formattedValues
                }).unwrap();
                message.success("Inquiry updated successfully");
            } else {
                await createInquiry(formattedValues).unwrap();
                message.success("Inquiry created successfully");
            }

            handleCancel();
        } catch (error) {
            console.error("Operation failed:", error);
            message.error(error?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={selectedInquiry ? "Edit Inquiry" : "Create New Inquiry"}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    status: "pending",
                }}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                        {
                            required: true,
                            message: "Please input the name!",
                        },
                    ]}
                >
                    <Input placeholder="Enter name" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {
                            required: true,
                            type: "email",
                            message: "Please input a valid email!",
                        },
                    ]}
                >
                    <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[
                        {
                            required: true,
                            message: "Please input the phone number!",
                        },
                    ]}
                >
                    <Input placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item
                    name="company_name"
                    label="Company Name"
                    rules={[
                        {
                            required: true,
                            message: "Please input the company name!",
                        },
                    ]}
                >
                    <Input placeholder="Enter company name" />
                </Form.Item>

                <Form.Item
                    name="date"
                    label="Date"
                    rules={[
                        {
                            required: true,
                            message: "Please select the date!",
                        },
                    ]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                        {
                            required: true,
                            message: "Please select the status!",
                        },
                    ]}
                >
                    <Select placeholder="Select status">
                        <Option value="pending">Pending</Option>
                        <Option value="in_progress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="message"
                    label="Message"
                    rules={[
                        {
                            required: true,
                            message: "Please input the message!",
                        },
                    ]}
                >
                    <TextArea rows={4} placeholder="Enter message" />
                </Form.Item>

                <Form.Item className="form-actions">
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {selectedInquiry ? "Update" : "Create"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateInquary;
