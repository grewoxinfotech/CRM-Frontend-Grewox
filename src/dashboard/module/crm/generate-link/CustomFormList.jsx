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
    message,
    Input,
    Divider
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
    FiDownload,
    FiX,
    FiFileText
} from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import dayjs from 'dayjs';
import './CustomForm.scss';
import { useNavigate } from 'react-router-dom';
import {
    EditOutlined,
    DeleteOutlined,
    LinkOutlined,
    EyeOutlined,
    FileTextOutlined,
    QrcodeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CustomFormList = ({ data = [], onEdit, onDelete }) => {
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedFormUrl, setSelectedFormUrl] = useState('');
    const [selectedFormTitle, setSelectedFormTitle] = useState('');
    const [selectedForm, setSelectedForm] = useState(null);
    const navigate = useNavigate();

    const showQrCode = (form) => {
        const formUrl = `${window.location.origin}/forms/${form.id}`;
        setSelectedFormUrl(formUrl);
        setSelectedFormTitle(form.title);
        setSelectedForm(form);
        setQrModalVisible(true);
    };

    const copyLink = (formId) => {
        const formUrl = `${window.location.origin}/forms/${formId}`;
        navigator.clipboard.writeText(formUrl);
        message.success('Link copied to clipboard!');
    };

    const handleViewForm = (formId) => {
        const formUrl = `${window.location.origin}/forms/${formId}`;
        window.open(formUrl, '_blank');
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById('qr-code-canvas');
        const qrContainer = document.getElementById('qr-container');

        if (qrContainer) {
            const newCanvas = document.createElement('canvas');
            const ctx = newCanvas.getContext('2d');

            newCanvas.width = 450;
            newCanvas.height = 700;

            // Fill background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

            // Draw curved background
            ctx.beginPath();
            ctx.fillStyle = 'rgba(240, 247, 255, 1)';
            ctx.moveTo(0, 0);
            ctx.lineTo(newCanvas.width, 0);
            ctx.lineTo(newCanvas.width, 160);
            ctx.quadraticCurveTo(newCanvas.width / 2, 260, 0, 160);
            ctx.closePath();
            ctx.fill();

            // Load and draw Grewox logo
            const logo = new Image();
            logo.onload = () => {
                // Draw logo at the top
                const logoHeight = 60;
                const logoWidth = (logo.width / logo.height) * logoHeight;
                const logoX = (newCanvas.width - logoWidth) / 2;
                ctx.drawImage(logo, logoX, 40, logoWidth, logoHeight);

                // Add event details with improved typography
                ctx.textAlign = 'center';

                // Event Name
                ctx.font = 'bold 22px Poppins';
                ctx.fillStyle = '#1890ff';
                ctx.fillText(selectedForm.event_name, newCanvas.width / 2, 160);

                // Location
                ctx.font = '15px Poppins';
                ctx.fillStyle = '#666666';
                ctx.fillText(selectedForm.event_location, newCanvas.width / 2, 190);

                // Dates
                const dateText = `${dayjs(selectedForm.start_date).format('MMM D')} - ${dayjs(selectedForm.end_date).format('MMM D, YYYY')}`;
                ctx.fillText(dateText, newCanvas.width / 2, 220);

                // Draw QR code with shadow
                if (canvas) {
                    const qrSize = 280;
                    const x = (newCanvas.width - qrSize) / 2;
                    const y = 260;

                    // Draw QR background with shadow
                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                    ctx.shadowBlur = 40;
                    ctx.shadowOffsetY = 20;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.roundRect(x - 24, y - 24, qrSize + 48, qrSize + 48, 20);
                    ctx.fill();
                    ctx.restore();

                    // Add subtle blue border
                    ctx.strokeStyle = 'rgba(24, 144, 255, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.roundRect(x - 24, y - 24, qrSize + 48, qrSize + 48, 20);
                    ctx.stroke();

                    // Draw QR code
                    ctx.drawImage(canvas, x, y, qrSize, qrSize);
                }

                // Add scan instructions
                ctx.font = '500 15px Poppins';
                ctx.fillStyle = '#666666';
                ctx.fillText('Scan to access form', newCanvas.width / 2, 620);

                // Add powered by text
                ctx.font = '13px Poppins';
                ctx.fillStyle = '#999999';
                ctx.fillText('Powered by ', newCanvas.width / 2 - 30, 650);

                // Add Grewox with gradient
                ctx.font = '600 13px Poppins';
                const gradient = ctx.createLinearGradient(
                    newCanvas.width / 2 + 10, 650,
                    newCanvas.width / 2 + 60, 650
                );
                gradient.addColorStop(0, '#1890ff');
                gradient.addColorStop(1, '#096dd9');
                ctx.fillStyle = gradient;
                ctx.fillText('Grewox', newCanvas.width / 2 + 30, 650);

                // Download the canvas
                const downloadLink = document.createElement('a');
                downloadLink.href = newCanvas.toDataURL('image/png', 1.0);
                const fileName = `${selectedForm.event_name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            logo.src = '/src/assets/logo/Group 48096906.png';
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

    const handleCardClick = (e, form) => {
        // Prevent navigation if clicking on action buttons
        if (e.target.closest('.card-actions')) {
            return;
        }
        navigate(`/dashboard/crm/custom-form/${form.id}/submissions`);
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
            <Row gutter={[24, 24]} className="custom-form-list">
                {data.map((form) => (
                    <Col xs={24} sm={12} lg={8} key={form.id}>
                        <Card
                            hoverable
                            className="custom-form-card"
                            bodyStyle={{
                                padding: "0",
                            }}
                            onClick={(e) => handleCardClick(e, form)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-header-gradient">
                                <div className="card-header-content">
                                    <div className="form-icon">
                                        <FiFileText />
                                    </div>
                                    <div className="form-count">
                                        <Text>{getFieldsCount(form.fields)}</Text>
                                        <Text>Fields</Text>
                                    </div>
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="form-header">
                                    <Title level={4} ellipsis={{ tooltip: form.title }}>
                                        {form.title}
                                    </Title>
                                    <Text type="secondary" ellipsis={{ tooltip: form.description }}>
                                        {form.description}
                                    </Text>
                                </div>

                                <div className="form-details">
                                    <div className="detail-item">
                                        <FiCalendar className="icon" />
                                        <div className="detail-content">
                                            <Text type="secondary">Event</Text>
                                            <Text strong ellipsis>{form.event_name}</Text>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <FiMapPin className="icon" />
                                        <div className="detail-content">
                                            <Text type="secondary">Location</Text>
                                            <Text strong ellipsis>{form.event_location}</Text>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-dates">
                                    <div className="date-item">
                                        <Text type="secondary">Starts</Text>
                                        <Tag color="blue">
                                            {dayjs(form.start_date).format('MMM D, YYYY')}
                                        </Tag>
                                    </div>
                                    <div className="date-item">
                                        <Text type="secondary">Ends</Text>
                                        <Tag color="green">
                                            {dayjs(form.end_date).format('MMM D, YYYY')}
                                        </Tag>
                                    </div>
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <div className="form-footer">
                                    <div className="created-info">
                                        <Text type="secondary" className="created-by">
                                            {form.created_by}
                                        </Text>
                                        <Text type="secondary" className="created-date">
                                            {dayjs(form.createdAt).format('MMM D, YYYY')}
                                        </Text>
                                    </div>
                                    <div className="action-buttons">
                                        <Tooltip title="View Submissions">
                                            <Button
                                                type="text"
                                                icon={<EyeOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/crm/custom-form/${form.id}/submissions`);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Edit Form">
                                            <Button
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(form);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Copy Link">
                                            <Button
                                                type="text"
                                                icon={<LinkOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyLink(form.id);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="QR Code">
                                            <Button
                                                type="text"
                                                icon={<QrcodeOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showQrCode(form);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Delete Form">
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(form);
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={null}
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={null}
                width={550}
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
                        onClick={() => setQrModalVisible(false)}
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
                            <FiLink style={{ fontSize: "24px", color: "#ffffff" }} />
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
                                QR Code
                            </h2>
                            <Text
                                style={{
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                Scan or download the QR code to access the form
                            </Text>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px" }}>
                    <div id="qr-container" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                        background: "#ffffff",
                        padding: "32px",
                        borderRadius: "24px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                        fontFamily: "'Poppins', sans-serif",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "160px",
                            background: "linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)",
                            borderRadius: "24px 24px 100% 100%",
                            zIndex: 0
                        }} />
                        <div style={{
                            marginTop: "12px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1
                        }}>
                            <img
                                src="/src/assets/logo/Group 48096906.png"
                                alt="Grewox Logo"
                                style={{
                                    height: "80px",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                                    marginBottom: "12px"
                                }}
                            />
                        </div>

                        {selectedForm && (
                            <div style={{
                                textAlign: "center",
                                marginTop: "8px",
                                position: "relative",
                                zIndex: 1
                            }}>
                                <Text strong style={{
                                    fontSize: "22px",
                                    display: "block",
                                    fontFamily: "'Poppins', sans-serif",
                                    marginBottom: "12px",
                                    color: "#1890ff",
                                    fontWeight: "600"
                                }}>
                                    {selectedForm.event_name}
                                </Text>
                                <Text style={{
                                    fontSize: "15px",
                                    display: "block",
                                    margin: "4px 0",
                                    color: "#666",
                                    fontFamily: "'Poppins', sans-serif"
                                }}>
                                    {selectedForm.event_location}
                                </Text>
                                <Text style={{
                                    fontSize: "15px",
                                    color: "#666",
                                    fontFamily: "'Poppins', sans-serif"
                                }}>
                                    {dayjs(selectedForm.start_date).format('MMM D')} - {dayjs(selectedForm.end_date).format('MMM D, YYYY')}
                                </Text>
                            </div>
                        )}

                        <div style={{
                            position: "relative",
                            zIndex: 1,
                            background: "white",
                            padding: "24px",
                            borderRadius: "20px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(24, 144, 255, 0.08)",
                            transform: "translateY(0)",
                            transition: "transform 0.3s ease",
                            border: "1px solid rgba(24, 144, 255, 0.1)"
                        }}>
                            <QRCodeCanvas
                                id="qr-code-canvas"
                                value={selectedFormUrl}
                                size={280}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "/src/assets/icons/icon-96x96.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 50,
                                    width: 50,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            position: "relative",
                            zIndex: 1
                        }}>
                            <Text style={{
                                fontSize: "15px",
                                color: "#666",
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 500
                            }}>
                                Scan to access form
                            </Text>

                            <Text style={{
                                fontSize: "13px",
                                color: "#999",
                                fontFamily: "'Poppins', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                            }}>
                                Powered by <span style={{ fontWeight: 600, background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Grewox CRM</span>
                            </Text>
                        </div>
                    </div>

                    <div style={{ marginTop: "24px" }}>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                            <Input
                                value={selectedFormUrl}
                                readOnly
                                style={{
                                    borderRadius: "8px",
                                    flex: 1
                                }}
                            />
                            <Button
                                icon={<FiCopy />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(selectedFormUrl);
                                    message.success('Link copied to clipboard!');
                                }}
                                style={{
                                    borderRadius: "8px",
                                    height: "40px",
                                }}
                            >
                                Copy
                            </Button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <Button
                                size="large"
                                onClick={() => setQrModalVisible(false)}
                                style={{
                                    padding: "8px 24px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    fontWeight: "500",
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                size="large"
                                type="primary"
                                icon={<FiDownload />}
                                onClick={downloadQRCode}
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
                                Download QR Code
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CustomFormList;