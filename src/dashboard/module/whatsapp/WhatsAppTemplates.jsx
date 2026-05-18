import React from 'react';
import { Card, Table, Tag, Typography, Button, Space, Spin, Empty, message, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiPlus, FiRefreshCw, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { useGetWhatsappTemplatesQuery, useSyncWhatsappTemplatesMutation } from '../settings/services/settingsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { useGetRolesQuery } from '../hrm/role/services/roleApi';
import PageHeader from '../../../components/PageHeader';

const { Title, Text } = Typography;

const categoryColors = {
    MARKETING: 'orange',
    UTILITY: 'blue',
};

export default function WhatsAppTemplates() {
    const navigate = useNavigate();
    const { data: templates = [], isLoading, isFetching, refetch } = useGetWhatsappTemplatesQuery();
    const [syncTemplates, { isLoading: isSyncing }] = useSyncWhatsappTemplatesMutation();

    const isSandbox = React.useMemo(() => {
        return templates && templates.length > 0 && templates[0].is_sandbox;
    }, [templates]);

    const currentUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);

    const hasPermission = React.useCallback((action) => {
        if (!currentUser) return false;
        if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-communication'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [currentUser, userPermissions]);

    const handleSync = async () => {
        try {
            await syncTemplates().unwrap();
            message.success('Templates synchronized with Meta successfully!');
            refetch();
        } catch (err) {
            message.error(err?.data?.message || 'Failed to sync templates');
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Tag icon={<FiCheckCircle style={{ marginRight: '4px' }} />} color="success">Approved</Tag>;
            case 'PENDING':
                return <Tag icon={<FiClock style={{ marginRight: '4px' }} />} color="warning">Pending Review</Tag>;
            case 'REJECTED':
                return <Tag icon={<FiXCircle style={{ marginRight: '4px' }} />} color="error">Rejected</Tag>;
            default:
                return <Tag color="default">{status || 'PENDING'}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Template Name',
            dataIndex: 'name',
            key: 'name',
            width: 220,
            render: (name) => <Text strong style={{ color: '#1e293b' }}>{name}</Text>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: (cat) => <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>,
        },
        {
            title: 'Language',
            dataIndex: 'language',
            key: 'language',
            width: 110,
            render: (lang) => <Tag color="purple">{lang}</Tag>,
        },
        {
            title: 'Message Content',
            dataIndex: 'components',
            key: 'components',
            render: (components) => {
                const body = components?.find(c => c.type === 'BODY')?.text || '';
                const header = components?.find(c => c.type === 'HEADER')?.text;
                const footer = components?.find(c => c.type === 'FOOTER')?.text;
                
                return (
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '500px' }}>
                        {header && <div style={{ fontWeight: '700', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>{header}</div>}
                        <div style={{ fontSize: '13.5px', color: '#1e293b', whiteSpace: 'pre-wrap' }}>{body}</div>
                        {footer && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{footer}</div>}
                    </div>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => getStatusTag(status),
        }
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <PageHeader
                title="Message Templates (Meta WABA)"
                subtitle="Manage, sync, and create templates for your broadcast campaigns directly from Grewox CRM."
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "WhatsApp" },
                    { title: "Message Templates" }
                ]}
                extraActions={[
                    <Button 
                        key="refresh"
                        icon={<FiRefreshCw className={isFetching ? 'spin' : ''} />} 
                        onClick={() => refetch()} 
                        loading={isFetching}
                    >
                        Refresh
                    </Button>,
                    <Button 
                        key="sync"
                        type="default"
                        onClick={handleSync}
                        loading={isSyncing}
                    >
                        Sync Meta Templates
                    </Button>,
                    hasPermission('create') && (
                        <Button 
                            key="create"
                            type="primary" 
                            icon={<FiPlus />} 
                            onClick={() => navigate('/dashboard/whatsapp/templates/create')}
                        >
                            Create Template
                        </Button>
                    )
                ].filter(Boolean)}
            />

            <div style={{ padding: '0 24px 24px 24px' }}>
                {isSandbox && (
                    <Alert
                        message={
                            <span style={{ fontWeight: '600', color: '#854d0e' }}>
                                ⚠️ Sandbox/Demo Mode Active
                            </span>
                        }
                        description={
                            <span style={{ color: '#a16207', fontSize: '13px' }}>
                                Meta WhatsApp Cloud API credentials are not configured yet. We are showing pre-approved sandbox templates. 
                                To fetch and manage your actual live Meta templates, go to{' '}
                                <Link to="/dashboard/settings/whatsapp" style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'underline' }}>
                                    WhatsApp Settings
                                </Link>{' '}
                                and link your Meta WABA account.
                            </span>
                        }
                        type="warning"
                        showIcon
                        closable
                        style={{ marginBottom: '16px', borderRadius: '12px', background: '#fef9c3', border: '1px solid #fef08a' }}
                    />
                )}

                <Card className="shadow-sm" style={{ borderRadius: '12px' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                            <Spin size="large" />
                        </div>
                    ) : templates.length === 0 ? (
                        <Empty description="No templates found. Build your first template by clicking 'Create Template' above!" />
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={templates}
                            pagination={{ pageSize: 15 }}
                            scroll={{ x: 800 }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}
