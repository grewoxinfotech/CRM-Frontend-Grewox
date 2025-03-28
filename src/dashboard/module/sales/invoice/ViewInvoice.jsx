import React from 'react';
import {
    Modal,
    Typography,
    Button,
    Table,
    Row,
    Col,
    Card,
    Divider,
    Image
} from 'antd';
import { FiX, FiDownload, FiPrinter, FiMail, FiClock } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const ViewInvoice = ({ open, onCancel, invoice }) => {
    if (!invoice) return null;

    const items = Array.isArray(invoice.items) ? invoice.items : [];

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Description',
            dataIndex: 'item_name',
            key: 'item_name',
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 100,
        },
        {
            title: 'Unit Price',
            dataIndex: 'rate',
            key: 'rate',
            align: 'right',
            width: 150,
            render: (rate) => `$${Number(rate).toFixed(2)}`,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            width: 150,
            render: (amount) => `$${Number(amount).toFixed(2)}`,
        },
    ];

    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const taxRate = Number(invoice.tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return (
        
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={900}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="invoice-view-modal"
        >
            <Card className="invoice-card">
                <div className="invoice-header">
                    <Button
                        type="text"
                        onClick={onCancel}
                        className="close-button"
                        icon={<FiX />}
                    />

                    
                    
                    <Row justify="space-between" align="top" gutter={24}>
                        <Col xs={24} sm={12}>
                            <div className="company-info">
                                <div className="company-logo">
                                    <Image
                                        preview={false}
                                        src="/path/to/your/logo.png"
                                        fallback="data:image/png;base64,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"
                                        alt="Company Logo"
                                        width={80}
                                        height={80}
                                    />
                                </div>
                                <Text className="company-name">Your Company Name</Text>
                                <Text className="company-website">www.yourcompany.com</Text>
                                <Text className="company-phone">(123) 456 7890</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div className="invoice-title">
                                <div className="invoice-status">
                                    <FiClock className="status-icon" />
                                    <Text>Due in 15 days</Text>
                                </div>
                                <Text className="title-text">INVOICE</Text>
                                <Text className="invoice-number">#{invoice.invoice_number || 'N/A'}</Text>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="invoice-body">
                    <Row gutter={[24, 24]} className="invoice-info">
                        <Col xs={24} md={12}>
                            <div className="info-section bill-to">
                                <Title level={5}>Bill To</Title>
                                <Text className="client-name">{invoice.client_name || 'N/A'}</Text>
                                <Text className="client-address">{invoice.client_address || 'N/A'}</Text>
                                <Text className="client-phone">{invoice.client_phone || 'N/A'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="info-section invoice-details">
                                <Row>
                                    <Col span={12}>
                                        <Text type="secondary">Invoice Date:</Text>
                                        <Text strong>
                                            {invoice.invoice_date ? dayjs(invoice.invoice_date).format('MMM DD, YYYY') : 'N/A'}
                                        </Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Due Date:</Text>
                                        <Text strong>
                                            {invoice.due_date ? dayjs(invoice.due_date).format('MMM DD, YYYY') : 'N/A'}
                                        </Text>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                    <div className="invoice-items">
                        <Table
                            dataSource={items}
                            columns={columns}
                            pagination={false}
                            rowKey={(record, index) => index}
                            summary={() => (
                                <Table.Summary>
                                    <Table.Summary.Row className="subtotal-row">
                                        <Table.Summary.Cell colSpan={4} align="right">
                                            <Text>Subtotal</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            <Text>${subtotal.toFixed(2)}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row className="tax-row">
                                        <Table.Summary.Cell colSpan={4} align="right">
                                            <Text>Tax ({taxRate}%)</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            <Text>${taxAmount.toFixed(2)}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row className="total-row">
                                        <Table.Summary.Cell colSpan={4} align="right">
                                            <Text strong>Total Amount</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            <Text strong className="total-amount">
                                                ${total.toFixed(2)}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )}
                        />
                    </div>

                    <Divider />

                    <div className="invoice-footer">
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <div className="terms-section">
                                    <Title level={5}>Terms & Conditions</Title>
                                    <Text>1. Payment is due within 15 days</Text>
                                    <Text>2. Please include invoice number on your payment</Text>
                                    <Text>3. Late payments are subject to fees</Text>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="payment-section">
                                    <Title level={5}>Payment Methods</Title>
                                    <div className="payment-options">
                                        <Button className="payment-method">Bank Transfer</Button>
                                        <Button className="payment-method">Credit Card</Button>
                                        <Button className="payment-method">PayPal</Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

               
            </Card>
        </Modal>
    );
};

export default ViewInvoice;