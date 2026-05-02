import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Input, Button, Space } from 'antd';
import { FiTarget, FiSearch } from 'react-icons/fi';

const { Text } = Typography;

const LeadsTable = ({
    leads,
    currencies,
    statusesData,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterLeadsByDate = (leads) => {
        if (!leads) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return leads.filter(lead => {
            const leadDate = new Date(lead.createdAt);
            switch (dateFilter) {
                case 'today': return leadDate >= today;
                case 'month': return leadDate >= firstDayOfMonth;
                case 'year': return leadDate >= firstDayOfYear;
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Lead Title",
            dataIndex: "leadTitle",
            key: "leadTitle",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: record.is_converted ? '#10b981' : '#3b82f6', fontSize: '10px' }}>
                        {text ? text[0].toUpperCase() : 'L'}
                    </Avatar>
                    <Text strong style={{ fontSize: '13px' }}>{text || 'Untitled'}</Text>
                </div>
            ),
        },
        {
            title: "Interest",
            dataIndex: "interest_level",
            key: "interest_level",
            render: (level) => {
                const colors = { high: 'success', medium: 'warning', low: 'error' };
                return <Tag color={colors[level?.toLowerCase()] || 'default'} style={{ borderRadius: '4px', border: 'none', fontSize: '11px', textTransform: 'capitalize' }}>{level || '-'}</Tag>;
            },
            align: 'center'
        },
        {
            title: "Value",
            dataIndex: "leadValue",
            key: "leadValue",
            align: 'right',
            render: (value, record) => {
                const currency = currencies?.find(c => c.id === record.currency);
                return <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>{currency?.currencyIcon || '₹'}{Number(value || 0).toLocaleString()}</Text>;
            }
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (statusId) => {
                const status = statusesData?.find(s => s.id === statusId);
                return <Tag style={{ borderRadius: '4px', fontSize: '11px' }}>{status?.name || '-'}</Tag>;
            },
            align: 'center'
        }
    ];

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#3b82f6', p: '6px', borderRadius: '6px', display: 'flex' }}><FiTarget style={{ color: 'white' }} /></div>
                    <Text strong style={{ fontSize: '15px' }}>Lead Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{leads?.length || 0}</Tag>
                </div>
            }
            extra={
                <Radio.Group value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="small">
                    <Radio.Button value="all">All</Radio.Button>
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="month">Month</Radio.Button>
                </Radio.Group>
            }
        >
            <Table
                dataSource={filterLeadsByDate(leads)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/crm/leads/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default LeadsTable;