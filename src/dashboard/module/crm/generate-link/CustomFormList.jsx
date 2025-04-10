import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Space,
    Button,
    Modal,
    Tooltip,
    Empty,
    message
} from 'antd';
import {
    FiCalendar,
    FiMapPin,
    FiEdit2,
    FiTrash2,
    FiLink,
    FiCopy,
    FiEye,
    FiList,
    FiDownload
} from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import dayjs from 'dayjs';
import './CustomForm.scss';

const { Title, Text } = Typography;

const CustomFormList = ({ data = [], onEdit, onDelete, onView }) => {
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedFormUrl, setSelectedFormUrl] = useState('');
    const [selectedFormTitle, setSelectedFormTitle] = useState('');

    const showQrCode = (formId, title) => {
        const formUrl = `${window.location.origin}/forms/${formId}`;
        setSelectedFormUrl(formUrl);
        setSelectedFormTitle(title);
        setQrModalVisible(true);
    };

    const copyLink = (formId) => {
        const formUrl = `${window.location.origin}/forms/${formId}`;
        navigator.clipboard.writeText(formUrl);
        message.success('Link copied to clipboard!');
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `${selectedFormTitle.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const getFieldsCount = (fieldsString) => {
        try {
            const fields = JSON.parse(fieldsString);
            return Object.keys(fields).length;
        } catch (error) {
            return 0;
        }
    };

    if (!data || data.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No custom forms found"
            />
        );
    }

    return (
        <>
            <Row gutter={[16, 16]} className="custom-form-list">
                {data.map((form) => (
                    <Col xs={24} sm={12} lg={8} key={form.id}>
                        <Card
                            hoverable
                            className="custom-form-card"
                            actions={[
                                <Tooltip title="Edit Form">
                                    <Button
                                        type="text"
                                        icon={<FiEdit2 />}
                                        onClick={() => onEdit(form)}
                                    />
                                </Tooltip>,
                                <Tooltip title="View Form">
                                    <Button
                                        type="text"
                                        icon={<FiEye />}
                                        onClick={() => onView(form)}
                                    />
                                </Tooltip>,
                                <Tooltip title="Generate QR Code">
                                    <Button
                                        type="text"
                                        icon={<FiLink />}
                                        onClick={() => showQrCode(form.id, form.title)}
                                    />
                                </Tooltip>,
                                <Tooltip title="Copy Link">
                                    <Button
                                        type="text"
                                        icon={<FiCopy />}
                                        onClick={() => copyLink(form.id)}
                                    />
                                </Tooltip>,
                                <Tooltip title="Delete Form">
                                    <Button
                                        type="text"
                                        icon={<FiTrash2 />}
                                        onClick={() => onDelete(form)}
                                        className="delete-button"
                                    />
                                </Tooltip>
                            ]}
                        >
                            <div className="form-header">
                                <Title level={4}>{form.title}</Title>
                                <Text type="secondary">{form.description}</Text>
                            </div>

                            <Space direction="vertical" className="form-details">
                                <Space>
                                    <FiCalendar className="icon" />
                                    <Text>{form.event_name}</Text>
                                </Space>
                                <Space>
                                    <FiMapPin className="icon" />
                                    <Text>{form.event_location}</Text>
                                </Space>
                                <Space>
                                    <FiList className="icon" />
                                    <Text>{getFieldsCount(form.fields)} Fields</Text>
                                </Space>
                            </Space>

                            <div className="form-dates">
                                <Tag color="blue">
                                    Start: {dayjs(form.start_date).format('MMM D, YYYY')}
                                </Tag>
                                <Tag color="green">
                                    End: {dayjs(form.end_date).format('MMM D, YYYY')}
                                </Tag>
                            </div>

                            <div className="form-meta">
                                <Text type="secondary">Created by: {form.created_by}</Text>
                                <Text type="secondary">
                                    {dayjs(form.createdAt).format('MMM D, YYYY')}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={`QR Code for ${selectedFormTitle}`}
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button
                        key="download"
                        type="primary"
                        icon={<FiDownload />}
                        onClick={downloadQRCode}
                    >
                        Download QR Code
                    </Button>
                ]}
                centered
            >
                <div className="qr-code-container">
                    <QRCodeCanvas
                        id="qr-code-canvas"
                        value={selectedFormUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                            src: "/logo.png",
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                    <Text copyable={{ text: selectedFormUrl }} className="form-url">
                        {selectedFormUrl}
                    </Text>
                </div>
            </Modal>
        </>
    );
};

export default CustomFormList; 