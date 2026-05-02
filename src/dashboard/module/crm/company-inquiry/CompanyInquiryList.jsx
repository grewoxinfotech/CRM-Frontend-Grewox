import React, { useMemo } from 'react';
import { Table, Button, Typography, Dropdown, Tag } from 'antd';
import { FiEdit2, FiEye, FiTrash2, FiMoreVertical, FiUser, FiBriefcase, FiPhone } from 'react-icons/fi';

const { Text } = Typography;

const CompanyInquiryList = ({
    loading,
    data = [],
    onEdit,
    onView,
    onDelete,
    searchText
}) => {
    const columns = [
        {
            title: "Inquirer Details",
            key: "inquirer",
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px', 
                        background: '#e0e7ff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#4338ca'
                    }}>
                        <FiUser size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#1e293b' }}>{record.fullname || 'N/A'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}><FiPhone size={10} /> {record.phone || 'N/A'}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Category",
            dataIndex: "business_category",
            key: "category",
            width: 180,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiBriefcase size={12} style={{ color: '#64748b' }} />
                    <Text style={{ fontSize: '13px' }}>{text || 'N/A'}</Text>
                </div>
            )
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            width: 300,
            render: (text) => <Text type="secondary" style={{ fontSize: '13px' }}>{text || '-'}</Text>
        },
        {
            title: "Created By",
            dataIndex: "created_by",
            key: "owner",
            width: 150,
            render: (text) => <Tag color="purple" style={{ borderRadius: '4px', border: 'none' }}>{text || 'N/A'}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'view', icon: <FiEye />, label: 'View', onClick: () => onView?.(record) },
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit?.(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete?.(record) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            ),
        },
    ];

    const filteredData = useMemo(() => {
        if (!searchText) return data;
        const searchLower = searchText.toLowerCase();
        return data.filter(item => 
            (item.fullname || '').toLowerCase().includes(searchLower) ||
            (item.business_category || '').toLowerCase().includes(searchLower) ||
            (item.phone || '').toLowerCase().includes(searchLower)
        );
    }, [data, searchText]);

    return (
        <div className="company-inquiry-list">
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey={(record) => record?._id || record?.id || Math.random().toString()}
                size="small"
                className="compact-table"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default CompanyInquiryList;