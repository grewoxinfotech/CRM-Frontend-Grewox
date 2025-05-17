import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiLink,
    FiBookOpen,
    FiFolder,
    FiCalendar,
    FiGlobe,
    FiVideo,
    FiFileText,
    FiCode,
    FiBook
} from 'react-icons/fi';
import moment from 'moment';
import './training.scss';

const TrainingList = ({
    loading,
    trainings = [],
    pagination = {},
    onEdit,
    onView,
    onDelete,
    onPageChange,
    onPageSizeChange
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    const handleTableChange = (pagination) => {
        onPageChange?.(pagination.current);
        onPageSizeChange?.(pagination.pageSize);
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={() => handleBulkDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const handleBulkDelete = (ids) => {
        Modal.confirm({
            title: 'Delete Selected Trainings',
            content: `Are you sure you want to delete ${ids.length} selected trainings?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                Promise.all(ids.map(id => onDelete(id)))
                    .then(() => {
                        message.success(`${ids.length} trainings deleted successfully`);
                        setSelectedRowKeys([]);
                    })
                    .catch((error) => {
                        message.error('Failed to delete trainings');
                    });
            },
        });
    };

    const isValidUrl = (urlString) => {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            const domainRegex = /^(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/;
            return domainRegex.test(urlString);
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        if (url.startsWith('www.') || isValidUrl(url)) {
            return `https://${url}`;
        }
        return url;
    };

    const renderLinks = (linksString) => {
        try {
            const links = typeof linksString === 'string' ? JSON.parse(linksString) : linksString;

            if (!Array.isArray(links?.urls) || !Array.isArray(links?.titles)) {
                console.error('Invalid links format:', links);
                return null;
            }

            return (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {links.titles.map((title, index) => {
                        const url = links.urls[index];
                        if (!url || !isValidUrl(url)) {
                            console.warn(`Invalid URL at index ${index}:`, url);
                            return null;
                        }

                        const formattedUrl = formatUrl(url);
                        const isYoutube = formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be');
                        const isDoc = formattedUrl.toLowerCase().includes('doc') || formattedUrl.toLowerCase().includes('pdf');
                        const isGithub = formattedUrl.includes('github.com');
                        const isNotion = formattedUrl.toLowerCase().includes('notion.so');

                        let icon = <FiGlobe size={14} />;
                        let color = '#2563EB';
                        let bgColor = '#EFF6FF';
                        let borderColor = '#BFDBFE';

                        if (isYoutube) {
                            icon = <FiVideo size={14} />;
                            color = '#DC2626';
                            bgColor = '#FEF2F2';
                            borderColor = '#FECACA';
                        } else if (isDoc) {
                            icon = <FiFileText size={14} />;
                            color = '#059669';
                            bgColor = '#ECFDF5';
                            borderColor = '#A7F3D0';
                        } else if (isGithub) {
                            icon = <FiCode size={14} />;
                            color = '#7C3AED';
                            bgColor = '#F5F3FF';
                            borderColor = '#DDD6FE';
                        } else if (isNotion) {
                            icon = <FiBook size={14} />;
                            color = '#4F46E5';
                            bgColor = '#EEF2FF';
                            borderColor = '#C7D2FE';
                        }

                        return (
                            <Tooltip
                                key={index}
                                title={formattedUrl}
                                placement="top"
                                color={color}
                            >
                                <div
                                    onClick={() => {
                                        window.open(formattedUrl, '_blank');
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: bgColor,
                                        border: `1px solid ${borderColor}`,
                                        color: color,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        gap: '6px',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`;
                                        e.currentTarget.style.backgroundColor = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.backgroundColor = bgColor;
                                    }}
                                >
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: color
                                    }}>
                                        {icon}
                                    </span>
                                    <span style={{
                                        color: '#374151',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '1.2'
                                    }}>
                                        {title}
                                    </span>
                                </div>
                            </Tooltip>
                        );
                    }).filter(Boolean)}
                </div>
            );
        } catch (e) {
            console.error('Error rendering links:', e);
            return null;
        }
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div className="icon-wrapper" style={{
                            color: "#7C3AED",
                            background: "rgba(124, 58, 237, 0.1)",
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
                        }}>
                            <FiBookOpen size={20} />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{
                                color: "#111827",
                                fontWeight: 600,
                                fontSize: '14px',
                                letterSpacing: '-0.01em'
                            }}>{text}</div>
                            <div className="meta" style={{
                                color: "#6B7280",
                                fontSize: '12px',
                                marginTop: '2px'
                            }}>{record.category}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Links",
            dataIndex: "links",
            key: "links",
            width: '50%',
            render: (links) => (
                <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    {renderLinks(links)}
                </div>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB'
                    }}>
                        <FiCalendar size={16} />
                    </div>
                    <div>
                        <div style={{
                            color: '#262626',
                            fontSize: '14px',
                            fontWeight: 500
                        }}>{moment(date).format('MMM DD, YYYY')}</div>
                        <div style={{
                            color: '#666',
                            fontSize: '12px'
                        }}>{moment(date).format('hh:mm A')}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                icon: <FiEye size={14} />,
                                label: 'View',
                                onClick: () => onView?.(record),
                            },
                            {
                                key: 'edit',
                                icon: <FiEdit2 size={14} />,
                                label: 'Edit',
                                onClick: () => onEdit?.(record),
                            },
                            {
                                key: 'delete',
                                icon: <FiTrash2 size={14} />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => onDelete?.(record.id),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        className="action-button"
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="training-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={trainings}
                loading={loading}
                rowKey="id"
                onChange={handleTableChange}
                pagination={{
                    current: pagination.current || 1,
                    pageSize: pagination.pageSize || 10,
                    total: pagination.total || 0,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    position: ['bottomRight']
                }}
                className="custom-table"
                scroll={{ x: 1000 }}
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
            />
        </div>
    );
};

export default TrainingList; 