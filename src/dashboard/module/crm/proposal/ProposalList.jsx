import React, { useState } from 'react';
import { Table, Tag, Dropdown, Button, Typography, Tooltip } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetLeadsQuery } from '../lead/services/LeadApi';

const { Text } = Typography;

const ProposalList = ({ proposals, onDelete, loading }) => {
    const { data: leadsResponse = {} } = useGetLeadsQuery({});
    const leads = leadsResponse.data || [];

    const leadTitleMap = React.useMemo(() => {
        const map = new Map();
        leads.forEach(lead => map.set(lead.id, lead.leadTitle || `Lead #${lead.id}`));
        return map;
    }, [leads]);

    const columns = [
        {
            title: 'Proposal',
            key: 'proposal',
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiFileText style={{ color: '#10b981' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#1e293b' }}>{leadTitleMap.get(record.lead_title) || 'Unknown Lead'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Proposal ID: {record.id?.slice(-8).toUpperCase()}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            width: 120,
            render: (amount) => <Text style={{ fontSize: '13px' }}>₹ {parseFloat(amount || 0).toLocaleString()}</Text>
        },
        {
            title: 'Total Amount',
            dataIndex: 'total',
            key: 'total',
            width: 150,
            render: (amount) => <Text strong style={{ color: '#2563eb', fontSize: '14px' }}>₹ {parseFloat(amount || 0).toLocaleString()}</Text>
        },
        {
            title: 'Valid Till',
            dataIndex: 'valid_till',
            key: 'date',
            width: 150,
            render: (date) => (
                <Tag color={dayjs(date).isBefore(dayjs()) ? 'error' : 'processing'} style={{ borderRadius: '4px', border: 'none' }}>
                    {dayjs(date).format('DD MMM YYYY')}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'view', icon: <FiFileText />, label: 'View', onClick: () => {} },
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => {} },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            )
        }
    ];

    return (
        <div className="proposal-list-container">
            <Table
                columns={columns}
                dataSource={proposals}
                rowKey="id"
                size="small"
                loading={loading}
                className="compact-table"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} proposals`
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default ProposalList;
