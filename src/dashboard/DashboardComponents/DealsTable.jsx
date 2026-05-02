import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio } from 'antd';
import { FiFileText } from 'react-icons/fi';

const { Text } = Typography;

const DealsTable = ({
    deals,
    currencies,
    stagesData,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterDealsByDate = (deals) => {
        if (!deals) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return deals.filter(deal => {
            const dealDate = new Date(deal.createdAt);
            switch (dateFilter) {
                case 'today': return dealDate >= today;
                case 'month': return dealDate >= firstDayOfMonth;
                case 'year': return dealDate >= firstDayOfYear;
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Deal Title",
            dataIndex: "dealTitle",
            key: "dealTitle",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: record.is_won ? '#10b981' : '#3b82f6', fontSize: '10px' }}>
                        {text ? text[0].toUpperCase() : 'D'}
                    </Avatar>
                    <Text strong style={{ fontSize: '13px' }}>{text || 'Untitled'}</Text>
                </div>
            ),
        },
        {
            title: "Stage",
            dataIndex: "stage",
            key: "stage",
            render: (stageId) => {
                const stage = stagesData?.filter(s => s.stageType === "deal").find(s => s.id === stageId);
                return <Tag style={{ borderRadius: '4px', fontSize: '11px', color: 'white', border: 'none', background: stage?.color || '#3b82f6' }}>{stage?.stageName || '-'}</Tag>;
            },
            align: 'center'
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
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
            render: (_, record) => {
                const statusName = record.is_won === true ? 'Won' : record.is_won === false ? 'Lost' : 'Pending';
                const colors = { Won: 'success', Lost: 'error', Pending: 'warning' };
                return <Tag color={colors[statusName]} style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>{statusName}</Tag>;
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
                    <div style={{ background: '#3b82f6', p: '6px', borderRadius: '6px', display: 'flex' }}><FiFileText style={{ color: 'white' }} /></div>
                    <Text strong style={{ fontSize: '15px' }}>Deal Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{deals?.length || 0}</Tag>
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
                dataSource={filterDealsByDate(deals)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/crm/deal/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default DealsTable;