import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, InputNumber, Row, Col, Divider, Space, Typography } from 'antd';
import { FiX, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditInvoice = ({ open, onCancel, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                date: initialValues.date ? dayjs(initialValues.date) : null,
                due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
                items: initialValues.items ? JSON.parse(initialValues.items) : [{}]
            });
            calculateTotals(initialValues.items ? JSON.parse(initialValues.items) : []);
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();

            formData.append('invoice_number', values.invoice_number || '');
            formData.append('customer_id', values.customer_id || '');
            formData.append('date', values.date?.format('YYYY-MM-DD') || '');
            formData.append('due_date', values.due_date?.format('YYYY-MM-DD') || '');
            formData.append('status', values.status || 'draft');
            formData.append('items', JSON.stringify(values.items || []));
            formData.append('subtotal', values.subtotal || 0);
            formData.append('tax', values.tax || 0);
            formData.append('discount', values.discount || 0);
            formData.append('total', values.total || 0);
            formData.append('notes', values.notes || '');
            formData.append('terms', values.terms || '');

            await onSubmit(formData);
            form.resetFields();
        } catch (error) {
            console.error('Submit Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (items = []) => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = form.getFieldValue('tax') || 0;
        const discount = form.getFieldValue('discount') || 0;
        const total = subtotal + (subtotal * tax / 100) - discount;

        form.setFieldsValue({
            subtotal,
            total: Math.round(total * 100) / 100
        });
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
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
                    className="close-button"
                >
                    <FiX style={{ fontSize: '20px' }} />
                </Button>
                <div className="header-content">
                    <div className="header-icon">
                        <FiFileText style={{ fontSize: '24px' }} />
                    </div>
                    <div className="header-text">
                        <h2>Edit Invoice</h2>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                            Update invoice information
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                initialValues={{
                    status: 'draft',
                    tax: 0,
                    discount: 0,
                    items: [{}]
                }}
                className="invoice-form"
            >
                <Row gutter={16} style={{ padding: '24px' }}>
                    <Col span={8}>
                        <Form.Item
                            name="invoice_number"
                            label={<span className="form-label">Invoice Number</span>}
                            rules={[
                                { required: true, message: 'Please enter invoice number' }
                            ]}
                        >
                            <Input
                                prefix={<FiFileText style={{ color: '#1890ff' }} />}
                                placeholder="Enter invoice number"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="customer_id"
                            label={<span className="form-label">Customer</span>}
                            rules={[
                                { required: true, message: 'Please select customer' }
                            ]}
                        >
                            <Select
                                placeholder="Select customer"
                                size="large"
                                showSearch
                                optionFilterProp="children"
                            >
                                {/* Add customer options here */}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="status"
                            label={<span className="form-label">Status</span>}
                        >
                            <Select size="large">
                                <Option value="draft">Draft</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="paid">Paid</Option>
                                <Option value="overdue">Overdue</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} style={{ padding: '0 24px' }}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label={<span className="form-label">Invoice Date</span>}
                            rules={[
                                { required: true, message: 'Please select invoice date' }
                            ]}
                        >
                            <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="due_date"
                            label={<span className="form-label">Due Date</span>}
                            rules={[
                                { required: true, message: 'Please select due date' }
                            ]}
                        >
                            <DatePicker size="large" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" style={{ margin: '24px 0 12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Invoice Items</span>
                </Divider>

                <div className="invoice-items" style={{ padding: '0 24px' }}>
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={16} key={key} style={{ marginBottom: 16 }}>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                rules={[
                                                    { required: true, message: 'Please enter item description' }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Item description"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                rules={[
                                                    { required: true, message: 'Please enter quantity' }
                                                ]}
                                            >
                                                <InputNumber
                                                    placeholder="Quantity"
                                                    size="large"
                                                    min={1}
                                                    style={{ width: '100%' }}
                                                    onChange={() => calculateTotals(form.getFieldValue('items'))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                rules={[
                                                    { required: true, message: 'Please enter price' }
                                                ]}
                                            >
                                                <InputNumber
                                                    placeholder="Price"
                                                    size="large"
                                                    min={0}
                                                    style={{ width: '100%' }}
                                                    onChange={() => calculateTotals(form.getFieldValue('items'))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'amount']}
                                            >
                                                <InputNumber
                                                    placeholder="Amount"
                                                    size="large"
                                                    disabled
                                                    style={{ width: '100%' }}
                                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={1}>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="text"
                                                    icon={<FiTrash2 style={{ color: '#ff4d4f' }} />}
                                                    onClick={() => {
                                                        remove(name);
                                                        calculateTotals(form.getFieldValue('items'));
                                                    }}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<FiPlus />}
                                        style={{ width: '100%' }}
                                    >
                                        Add Item
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </div>

                <Row gutter={16} justify="end" style={{ padding: '0 24px' }}>
                    <Col span={8}>
                        <div className="totals-section">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row justify="space-between">
                                    <Text>Subtotal:</Text>
                                    <Form.Item
                                        name="subtotal"
                                        style={{ margin: 0 }}
                                    >
                                        <InputNumber
                                            disabled
                                            style={{ width: '150px', textAlign: 'right' }}
                                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Form.Item>
                                </Row>
                                <Row justify="space-between">
                                    <Text>Tax (%):</Text>
                                    <Form.Item
                                        name="tax"
                                        style={{ margin: 0 }}
                                    >
                                        <InputNumber
                                            style={{ width: '150px' }}
                                            min={0}
                                            max={100}
                                            onChange={() => calculateTotals(form.getFieldValue('items'))}
                                        />
                                    </Form.Item>
                                </Row>
                                <Row justify="space-between">
                                    <Text>Discount:</Text>
                                    <Form.Item
                                        name="discount"
                                        style={{ margin: 0 }}
                                    >
                                        <InputNumber
                                            style={{ width: '150px' }}
                                            min={0}
                                            onChange={() => calculateTotals(form.getFieldValue('items'))}
                                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Form.Item>
                                </Row>
                                <Divider style={{ margin: '12px 0' }} />
                                <Row justify="space-between">
                                    <Text strong>Total:</Text>
                                    <Form.Item
                                        name="total"
                                        style={{ margin: 0 }}
                                    >
                                        <InputNumber
                                            disabled
                                            style={{ width: '150px', textAlign: 'right' }}
                                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Form.Item>
                                </Row>
                            </Space>
                        </div>
                    </Col>
                </Row>

                <Row gutter={16} style={{ padding: '24px' }}>
                    <Col span={12}>
                        <Form.Item
                            name="notes"
                            label={<span className="form-label">Notes</span>}
                        >
                            <TextArea
                                placeholder="Enter notes"
                                rows={4}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="terms"
                            label={<span className="form-label">Terms & Conditions</span>}
                        >
                            <TextArea
                                placeholder="Enter terms and conditions"
                                rows={4}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '0' }} />

                <div className="form-actions">
                    <Button
                        size="large"
                        onClick={onCancel}
                        className="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="submit-button"
                    >
                        Update Invoice
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditInvoice; 