import React from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Space,
    Select,
    Switch,
    Divider,
    DatePicker,
    TimePicker,
    InputNumber,
} from "antd";
import {
    FiFileText,
    FiX,
    FiPlus,
    FiMinus,
    FiCalendar,
    FiMapPin,
    FiMail,
    FiPhone,
    FiLink,
    FiCheckSquare,
    FiList,
} from "react-icons/fi";
import "./CustomForm.scss";
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const fieldTypes = [
    { value: 'text', label: 'Short Text', icon: <FiFileText />, validations: ['minLength', 'maxLength'] },
    { value: 'textarea', label: 'Long Text', icon: <FiFileText />, validations: ['minLength', 'maxLength'] },
    { value: 'number', label: 'Number', icon: <FiList />, validations: ['min', 'max'] },
    { value: 'phone', label: 'Phone', icon: <FiPhone />, validations: ['minLength'] },
    { value: 'email', label: 'Email', icon: <FiMail /> },
    { value: 'url', label: 'URL', icon: <FiLink /> },
    { value: 'date', label: 'Date', icon: <FiCalendar />, validations: ['minDate', 'maxDate'] },
    { value: 'time', label: 'Time', icon: <FiCalendar /> },
    { value: 'datetime', label: 'Date & Time', icon: <FiCalendar />, validations: ['minDate', 'maxDate'] },
    { value: 'boolean', label: 'Yes/No', icon: <FiCheckSquare /> },
    { value: 'select', label: 'Single Select', icon: <FiList />, hasOptions: true },
    { value: 'multiselect', label: 'Multi Select', icon: <FiList />, hasOptions: true, validations: ['minSelect', 'maxSelect'] },
    { value: 'radio', label: 'Radio Buttons', icon: <FiList />, hasOptions: true },
    { value: 'checkbox', label: 'Checkboxes', icon: <FiList />, hasOptions: true, validations: ['minSelect', 'maxSelect'] },
    { value: 'password', label: 'Password', icon: <FiFileText />, validations: ['minLength', 'maxLength'] },
];

const CreateCustomForm = ({ open, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            // Transform fields array to object format with validation rules
            const fieldsObject = values.fields.reduce((acc, field) => {
                const fieldType = fieldTypes.find(t => t.value === field.type);
                const fieldConfig = {
                    type: field.type,
                    required: field.required,
                };

                // Add validation rules if present
                if (field.validation) {
                    fieldConfig.validation = {};
                    Object.entries(field.validation).forEach(([key, value]) => {
                        if (value !== undefined && value !== '') {
                            fieldConfig.validation[key] = value;
                        }
                    });
                }

                // Add options for select/radio/checkbox fields
                if (fieldType?.hasOptions && field.options) {
                    fieldConfig.options = field.options.split(',').map(opt => opt.trim());
                }

                acc[field.name] = fieldConfig;
                return acc;
            }, {});

            const formData = {
                ...values,
                fields: fieldsObject,
                start_date: values.event_dates[0].toISOString(),
                end_date: values.event_dates[1].toISOString(),
            };
            delete formData.event_dates;

            await onSubmit(formData);
            form.resetFields();
        } catch (error) {
            console.error("Submit Error:", error);
        }
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
                        <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
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
                            Create Custom Form
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Create a new custom form with dynamic fields
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
                    padding: "24px",
                }}
            >
                <Form.Item
                    name="title"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                            Form Title <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter form title" }]}
                >
                    <Input
                        placeholder="Enter form title"
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
                    name="description"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                            Description <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter form description" }]}
                >
                    <TextArea
                        placeholder="Enter form description"
                        rows={4}
                        style={{
                            borderRadius: "10px",
                            padding: "12px 16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                            minHeight: "120px",
                            resize: "vertical",
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: "24px 0" }}>Event Details</Divider>

                <Form.Item
                    name="event_name"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Name <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter event name" }]}
                >
                    <Input
                        placeholder="Enter event name"
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
                    name="event_location"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiMapPin style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Location <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter event location" }]}
                >
                    <Input
                        placeholder="Enter event location"
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
                    name="event_dates"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Dates <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please select event dates" }]}
                >
                    <RangePicker
                        format="YYYY-MM-DD"
                        placeholder={["Start Date", "End Date"]}
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            height: "48px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: "24px 0" }}>Form Fields</Divider>

                <Form.List
                    name="fields"
                    initialValue={[{ name: '', type: 'text', required: false }]}
                >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => {
                                const selectedType = form.getFieldValue(['fields', name, 'type']) || 'text';
                                const fieldType = fieldTypes.find(t => t.value === selectedType);

                                return (
                                    <div key={key} className="field-config-container">
                                        <Space style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                rules={[{ required: true, message: 'Missing field name' }]}
                                                style={{ flex: 1 }}
                                            >
                                                <Input
                                                    placeholder="Field name"
                                                    style={{
                                                        borderRadius: "10px",
                                                        padding: "8px 16px",
                                                        backgroundColor: "#f8fafc",
                                                        border: "1px solid #e6e8eb",
                                                    }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'type']}
                                                rules={[{ required: true, message: 'Missing field type' }]}
                                                initialValue="text"
                                            >
                                                <Select
                                                    style={{
                                                        width: 180,
                                                        borderRadius: "10px",
                                                    }}
                                                    placeholder="Field type"
                                                    onChange={(value) => {
                                                        // Clear validation values when type changes
                                                        const currentValues = form.getFieldValue(['fields', name, 'validation']) || {};
                                                        Object.keys(currentValues).forEach(key => {
                                                            form.setFieldValue(['fields', name, 'validation', key], undefined);
                                                        });
                                                        // Clear options when type changes
                                                        form.setFieldValue(['fields', name, 'options'], undefined);

                                                        // Force re-render by updating the form
                                                        form.setFieldsValue({
                                                            fields: form.getFieldValue('fields')
                                                        });
                                                    }}
                                                >
                                                    {fieldTypes.map(type => (
                                                        <Option key={type.value} value={type.value}>
                                                            <Space>
                                                                {type.icon}
                                                                {type.label}
                                                            </Space>
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'required']}
                                                valuePropName="checked"
                                                initialValue={false}
                                            >
                                                <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                                            </Form.Item>
                                            <Button
                                                type="text"
                                                icon={<FiMinus />}
                                                onClick={() => remove(name)}
                                                style={{
                                                    color: "#ff4d4f",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        </Space>

                                        {selectedType && fieldType && fieldType.validations && fieldType.validations.length > 0 && (
                                            <div className="field-validation-container" style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                                {fieldType.hasOptions && (
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'options']}
                                                        label={
                                                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                                                <FiList style={{ marginRight: "8px", color: "#1890ff" }} />
                                                                Options (comma-separated)
                                                            </span>
                                                        }
                                                        rules={[{ required: true, message: 'Please enter options' }]}
                                                    >
                                                        <Input
                                                            placeholder="Option 1, Option 2, Option 3"
                                                            style={{
                                                                borderRadius: "8px",
                                                                backgroundColor: "#ffffff",
                                                            }}
                                                        />
                                                    </Form.Item>
                                                )}

                                                {fieldType.validations?.map(validation => (
                                                    <Form.Item
                                                        key={validation}
                                                        {...restField}
                                                        name={[name, 'validation', validation]}
                                                        label={
                                                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                                                <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                                                                {validation.charAt(0).toUpperCase() + validation.slice(1)}
                                                            </span>
                                                        }
                                                    >
                                                        {validation === 'minDate' || validation === 'maxDate' ? (
                                                            <DatePicker
                                                                style={{
                                                                    width: '100%',
                                                                    borderRadius: "8px",
                                                                    backgroundColor: "#ffffff",
                                                                }}
                                                            />
                                                        ) : (
                                                            <InputNumber
                                                                placeholder={`Enter ${validation}`}
                                                                min={0}
                                                                style={{
                                                                    width: '100%',
                                                                    borderRadius: "8px",
                                                                    backgroundColor: "#ffffff",
                                                                }}
                                                            />
                                                        )}
                                                    </Form.Item>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        add({ name: '', type: 'text', required: false });
                                    }}
                                    block
                                    icon={<FiPlus />}
                                    style={{
                                        borderRadius: "10px",
                                        height: "44px",
                                    }}
                                >
                                    Add Field
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
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                        }}
                    >
                        Create Form
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCustomForm;