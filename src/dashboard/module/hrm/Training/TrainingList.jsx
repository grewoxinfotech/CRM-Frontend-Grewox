import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message, Menu } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiLink, FiBookOpen, FiCalendar, FiGlobe, FiVideo, FiFileText, FiCode, FiBook } from 'react-icons/fi';
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

    const renderLinks = (linksString) => {
        try {
            const links = typeof linksString === 'string' ? JSON.parse(linksString) : linksString;
            let urls = links?.urls || (Array.isArray(links) ? links : [links?.url].filter(Boolean));
            if (!urls.length) return '-';
            return (
                <Space size={4} wrap>
                    {urls.map((url, i) => (
                        <Tooltip key={i} title={url}>
                            <Tag 
                                color="blue" 
                                style={{ borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#eff6ff', color: '#3b82f6', fontSize: '11px' }}
                                onClick={() => window.open(url, '_blank')}
                            >
                                <FiLink size={10} style={{ marginRight: '4px' }} />
                                Link {i + 1}
                            </Tag>
                        </Tooltip>
                    ))}
                </Space>
            );
        } catch (e) { return '-'; }
    };

    const columns = [
        {
            title: "Training Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiBookOpen color="#7c3aed" size={14} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{text}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{record.category}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Resources",
            dataIndex: "links",
            key: "links",
            render: (links) => renderLinks(links),
        },
        {
            title: "Date Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{moment(date).format('DD MMM, YYYY')}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{moment(date).format('hh:mm A')}</span>
                </Space>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 60,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item key="view" icon={<FiEye size={14} />} onClick={() => onView?.(record)}>View</Menu.Item>
                            <Menu.Item key="edit" icon={<FiEdit2 size={14} />} onClick={() => onEdit?.(record)}>Edit</Menu.Item>
                            <Menu.Item key="delete" danger icon={<FiTrash2 size={14} />} onClick={() => onDelete?.(record.id)}>Delete</Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button type="text" icon={<FiMoreVertical size={16} />} size="small" />
                </Dropdown>
            ),
        },
    ];

    return (
        <Table
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            columns={columns}
            dataSource={trainings}
            loading={loading}
            rowKey="id"
            size="small"
            className="compact-table"
            pagination={{
                current: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
                total: pagination.total || 0,
                showSizeChanger: true,
                size: 'small',
                onChange: (page, pageSize) => {
                    onPageChange?.(page);
                    if (pageSize !== pagination.pageSize) onPageSizeChange?.(pageSize);
                }
            }}
            scroll={{ x: 'max-content' }}
        />
    );
};

export default TrainingList;