import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message } from "antd";
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
} from "react-icons/fi";
import moment from "moment";
import { useGetAllTrainingsQuery, useDeleteTrainingMutation } from "./services/trainingApi";
import './training.scss';

const TrainingList = ({ loading, onEdit, onView, searchText, trainings }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const { data: trainingsData, isLoading } = useGetAllTrainingsQuery();
    const [deleteTraining] = useDeleteTrainingMutation();
    const data = trainingsData?.data || trainings;
    const [isMobile, setIsMobile] = useState(false);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    // Filter trainings based on search text
    const filteredTrainings = useMemo(() => {
        if (!data) return [];
        if (!searchText) return data;

        const searchLower = searchText.toLowerCase();
        return data.filter(training => {
            const title = training.title?.toLowerCase() || '';
            const category = training.category?.toLowerCase() || '';
            return title.includes(searchLower) || category.includes(searchLower);
        });
    }, [data, searchText]);

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Trainings' : 'Delete Training';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected trainings?`
            : 'Are you sure you want to delete this training?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteTraining(id).unwrap()));
                        message.success(`${recordOrIds.length} trainings deleted successfully`);
                        setSelectedRowKeys([]);
                    } else {
                        await deleteTraining(recordOrIds).unwrap();
                        message.success('Training deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete training(s)');
                }
            },
        });
    };

    const isValidUrl = (urlString) => {
        try {
            // Try to construct a URL object
            new URL(urlString);
            return true;
        } catch (e) {
            // If it fails, check if it's a valid domain format
            const domainRegex = /^(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/;
            return domainRegex.test(urlString);
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';

        // If URL already has a protocol, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // If URL starts with www. or is a valid domain, add https://
        if (url.startsWith('www.') || isValidUrl(url)) {
            return `https://${url}`;
        }

        return url;
    };

    const renderLinks = (linksString) => {
        try {
            const links = typeof linksString === 'string' ? JSON.parse(linksString) : linksString;

            // Validate URLs array
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
                                onClick: () => onView(record),
                            },
                            {
                                key: 'edit',
                                icon: <FiEdit2 size={14} />,
                                label: 'Edit',
                                onClick: () => onEdit(record),
                            },
                            {
                                key: 'delete',
                                icon: <FiTrash2 size={14} />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => handleDelete(record.id),
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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const paginationConfig = {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],

        locale: {
            items_per_page: isMobile ? '' : '/ page', // Hide '/ page' on mobile/tablet
        },
    };

    return (
        <div className="training-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredTrainings}
                loading={loading || isLoading}
                rowKey="id"
                pagination={paginationConfig}
                className="custom-table"
                scroll={{ x: 1000, y: '' }}
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