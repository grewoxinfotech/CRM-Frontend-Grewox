import React from 'react';
import { Modal, Button, Typography, Result } from 'antd';
import { FiArrowUpCircle, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const LimitReachedModal = ({ visible, onCancel, title, message, limitType }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onCancel();
        navigate('/dashboard/settings/plan');
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={480}
            centered
            destroyOnClose
            closeIcon={null}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '12px',
                    overflow: 'hidden'
                }
            }}
        >
            <div style={{
                padding: '32px 24px',
                textAlign: 'center',
                background: '#ffffff'
            }}>
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#8c8c8c'
                    }}
                >
                    <FiX size={20} />
                </Button>

                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fff1f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    color: '#ff4d4f'
                }}>
                    <FiArrowUpCircle size={32} />
                </div>

                <Title level={3} style={{ marginBottom: '12px', color: '#262626' }}>
                    {title || 'Limit Reached'}
                </Title>
                
                <Text style={{ fontSize: '16px', color: '#595959', display: 'block', marginBottom: '32px' }}>
                    {message || `You have reached the maximum limit of ${limitType || 'items'} for your current plan.`}
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleUpgrade}
                        style={{
                            height: '48px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Upgrade Plan
                    </Button>
                    <Button
                        type="text"
                        size="large"
                        block
                        onClick={onCancel}
                        style={{
                            height: '48px',
                            color: '#8c8c8c'
                        }}
                    >
                        Maybe Later
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LimitReachedModal;
