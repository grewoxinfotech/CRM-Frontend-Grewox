import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Input, Button, Space } from 'antd';
import { FiFileText, FiTarget } from 'react-icons/fi';

const { Text } = Typography;

const DealsTable = ({
    deals,
    loading,
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
                case 'today':
                    return dealDate >= today;
                case 'month':
                    return dealDate >= firstDayOfMonth;
                case 'year':
                    return dealDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Deal Title",
            dataIndex: "dealTitle",
            key: "dealTitle",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search deals..."
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 180, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small">Search</Button>
                        <Button onClick={clearFilters} size="small">Reset</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.dealTitle?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar style={{
                        backgroundColor: record.is_won ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {text?.[0]?.toUpperCase() || 'D'}
                    </Avatar>
                    <Text strong>{text || 'Untitled Deal'}</Text>
                </div>
            ),
        },
        {
            title: "Stage",
            dataIndex: "stage",
            key: "stage",
            filters: stagesData?.filter(stage => stage.stageType === "deal").map(stage => ({
                text: stage.stageName,
                value: stage.id
            })) || [],
            onFilter: (value, record) => record.stage === value,
            render: (stageId) => {
                const stage = stagesData?.filter(stage => stage.stageType === "deal").find(s => s.id === stageId);
                return (
                    <Tag style={{
                        textTransform: 'capitalize',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        background: stage?.color || '#1890ff'
                    }}>
                        {stage?.stageName || 'Unknown Stage'}
                    </Tag>
                );
            },
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            sorter: (a, b) => (a.value || 0) - (b.value || 0),
            render: (value, record) => {
                const currency = currencies?.find(c => c.id === record.currency);
                return (
                    <Text strong style={{ fontSize: '13px', color: '#52c41a' }}>
                        {currency?.currencyIcon || ''} {(value || 0).toLocaleString()}
                    </Text>
                );
            }
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: 'Won', value: 'won' },
                { text: 'Pending', value: 'pending' },
                { text: 'Lost', value: 'lost' }
            ],
            onFilter: (value, record) => {
                if (value === 'won') return record.is_won === true;
                if (value === 'lost') return record.is_won === false;
                return record.is_won === null;
            },
            render: (status, record) => {
                const statusName = record.is_won === true ? 'Won' :
                    record.is_won === false ? 'Lost' : 'Pending';
                const statusColor = {
                    'Won': 'success',
                    'Lost': 'error',
                    'Pending': 'warning'
                }[statusName];

                return (
                    <Tag color={statusColor} style={{
                        textTransform: 'capitalize',
                        fontSize: '12px'
                    }}>
                        {statusName}
                    </Tag>
                );
            }
        }
    ];

    return (
        <Card
            className="leads-table-card"
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%' }}
        >
            <div className="table-header-wrapper" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f2ff 100%)',
                borderBottom: '1px solid #e6ffec',
                padding: '16px',
                borderRadius: '8px 8px 0 0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            background: '#52c41a',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiFileText style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={{
                            fontSize: '18px',
                            color: '#1f2937',
                            background: 'linear-gradient(90deg, #52c41a, #95de64)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '600',
                            letterSpacing: '-0.02em'
                        }}>
                            Deal Data
                        </Text>
                        <Tag style={{
                            marginLeft: '8px',
                            background: '#f6ffed',
                            border: 'none',
                            color: '#52c41a',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}>
                            {deals?.length || 0} Total
                        </Tag>
                    </div>
                    <Radio.Group
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        size="small"
                        className="date-filter-radio-group"
                    >
                        <Radio.Button className="date-filter-radio-button" value="all" style={{ fontSize: '12px', fontWeight: '500' }}>All Time</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="today" style={{ fontSize: '12px', fontWeight: '500' }}>Today</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="month" style={{ fontSize: '12px', fontWeight: '500' }}>This Month</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="year" style={{ fontSize: '12px', fontWeight: '500' }}>This Year</Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            <Table
                dataSource={[...Array(5)].map((_, index) => {
                    const filteredDeals = filterDealsByDate(deals) || [];
                    return filteredDeals[index] || {
                        id: `empty-${index}`,
                        dealTitle: '',
                        stage: '',
                        value: '',
                        status: '',
                        isEmpty: true
                    };
                })}
                columns={columns.map(col => ({
                    ...col,
                    render: (text, record) => {
                        if (record.isEmpty) {
                            return <div style={{ height: '24px' }}>&nbsp;</div>;
                        }
                        return col.render ? col.render(text, record) : text;
                    }
                }))}
                rowKey="id"
                pagination={false}
                className="colorful-table fixed-height-table"
                onRow={(record) => ({
                    onClick: !record.isEmpty ? () => navigate(`/dashboard/crm/deal/${record.id}`) : undefined,
                    style: {
                        cursor: !record.isEmpty ? 'pointer' : 'default',
                        background: record.isEmpty ? '#fafafa' : undefined
                    }
                })}
                scroll={{ x: true }}
                loading={loading}
            />
        </Card>
    );
};

export default DealsTable;