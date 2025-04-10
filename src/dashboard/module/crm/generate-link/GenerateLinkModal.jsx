import React from 'react';
import { Modal, Input, Button, Typography, message } from 'antd';
import { FiCopy, FiLink } from 'react-icons/fi';

const { Text } = Typography;

const GenerateLinkModal = ({ open, onCancel, formData }) => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/forms/${formData?.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formUrl)
            .then(() => {
                message.success('Link copied to clipboard');
            })
            .catch(() => {
                message.error('Failed to copy link');
            });
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
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
                            Form Link
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Share this link to collect form responses
                        </Text>
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <Text strong>Form Title:</Text>
                    <Text> {formData?.title}</Text>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        value={formUrl}
                        readOnly
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<FiCopy />}
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>
                </div>

                <div style={{ marginTop: "16px" }}>
                    <Text type="secondary">
                        This link will allow users to access and submit the form. The responses will be collected in your dashboard.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default GenerateLinkModal; 