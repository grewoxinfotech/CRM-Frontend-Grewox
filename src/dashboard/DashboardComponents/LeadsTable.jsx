import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Input, Button, Space } from 'antd';
import { FiTarget } from 'react-icons/fi';

const { Text } = Typography;

// Add responsive styles object
const responsiveStyles = {
    tableWrapper: {
        overflow: 'auto',
        overflowY: 'hidden',
        '@media (max-width: 768px)': {
            margin: '0 -16px',
        }
    },
    headerContainer: {
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px',
        borderRadius: '12px 12px 0 0',
        '@media (max-width: 768px)': {
            padding: '12px',
        }
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px',
        '@media (max-width: 576px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
        }
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        '@media (max-width: 576px)': {
            width: '100%',
        }
    },
    filterSection: {
        '@media (max-width: 576px)': {
            width: '100%',
            '.ant-radio-group': {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
            },
            '.ant-radio-button-wrapper': {
                flex: '1',
                textAlign: 'center',
                minWidth: 'calc(50% - 4px)',
            }
        }
    },
    iconContainer: {
        background: '#1d4ed8',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    titleText: {
        fontSize: '18px',
        color: '#0f172a',
        fontWeight: '600',
        letterSpacing: '-0.02em',
        '@media (max-width: 576px)': {
            fontSize: '16px',
        }
    },
    totalTag: {
        marginLeft: '8px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        color: '#334155',
        fontWeight: '600',
        fontSize: '13px',
        '@media (max-width: 576px)': {
            fontSize: '12px',
        }
    }
};

const LeadsTable = ({
    leads,
    // loading,
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
                case 'today':
                    return leadDate >= today;
                case 'month':
                    return leadDate >= firstDayOfMonth;
                case 'year':
                    return leadDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Lead Title",
            dataIndex: "leadTitle",
            key: "leadTitle",
            width: 220,
            ellipsis: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search leads..."
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: '100%', marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small">Search</Button>
                        <Button onClick={clearFilters} size="small">Reset</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.leadTitle.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                    <Avatar style={{
                        backgroundColor: record.is_converted ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {text && text[0] ? text[0].toUpperCase() : 'L'}
                    </Avatar>
                    <Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text || 'Untitled Lead'}
                    </Text>
                </div>
            ),
        },
        {
            title: "Interest Level",
            dataIndex: "interest_level",
            key: "interest_level",
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' }
            ],
            onFilter: (value, record) => record.interest_level === value,
            render: (level) => {
                const interestStyle = {
                    high: {
                        color: '#52c41a',
                        bg: 'rgba(82, 196, 26, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'High'
                    },
                    medium: {
                        color: '#faad14',
                        bg: 'rgba(250, 173, 20, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'Medium'
                    },
                    low: {
                        color: '#ff4d4f',
                        bg: 'rgba(255, 77, 79, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'Low'
                    }
                }[level] || {
                    color: '#1890ff',
                    bg: 'rgba(24, 144, 255, 0.1)',
                    icon: <FiTarget style={{ marginRight: '4px' }} />,
                    text: '-'
                };

                return (
                    <Tag style={{
                        color: interestStyle.color,
                        backgroundColor: interestStyle.bg,
                        border: `1px solid ${interestStyle.color}40`,
                        borderRadius: '999px',
                        padding: '2px 10px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }}>
                        {interestStyle.icon}
                        {interestStyle.text}
                    </Tag>
                );
            },
            width: 140,
            align: 'center'
        },
        {
            title: "Value",
            dataIndex: "leadValue",
            key: "leadValue",
            width: 130,
            align: 'right',
            sorter: (a, b) => (a.leadValue || 0) - (b.leadValue || 0),
            render: (value, record) => {
                const currency = currencies?.find(c => c.id === record.currency);
                const numericValue = Number(value) || 0;
                return (
                    <Text strong style={{ fontSize: '13px', color: numericValue > 0 ? '#16a34a' : '#64748b', whiteSpace: 'nowrap' }}>
                        {currency?.currencyIcon || '₹'} {numericValue.toLocaleString()}
                    </Text>
                );
            },
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            filters: statusesData?.map(status => ({
                text: status.name,
                value: status.id
            })) || [],
            onFilter: (value, record) => record.status === value,
            render: (statusId) => {
                const status = statusesData?.find(s => s.id === statusId) || {};
                const statusName = status.name || "Unknown";
                const statusColor = {
                    'Active': 'success',
                    'Closed': 'error',
                    'Pending': 'warning'
                }[statusName] || 'default';

                return (
                    <Tag color={statusColor} style={{
                        textTransform: 'capitalize',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        {statusName}
                    </Tag>
                );
            },
            width: 120,
            align: 'center'
        }
    ];
    const leadsColumnMap = Object.fromEntries(columns.map((col) => [col.key, col]));
    const orderedColumns = ["leadTitle", "status", "interest_level", "leadValue"]
        .map((key) => leadsColumnMap[key])
        .filter(Boolean);

    return (
        <Card
            className="leads-table-card"
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%' }}
        >
            <div style={responsiveStyles.headerContainer}>
                <div style={responsiveStyles.headerContent}>
                    <div style={responsiveStyles.titleSection}>
                        <div style={responsiveStyles.iconContainer}>
                            <FiTarget style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={responsiveStyles.titleText}>
                            Lead Data
                        </Text>
                        <Tag style={responsiveStyles.totalTag}>
                            {leads?.length || 0} Total
                        </Tag>
                    </div>
                    <div style={responsiveStyles.filterSection}>
                        <Radio.Group
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            size="small"
                            className="white-label-date-filter"
                        >
                            <Radio.Button value="all">All Time</Radio.Button>
                            <Radio.Button value="today">Today</Radio.Button>
                            <Radio.Button value="month">This Month</Radio.Button>
                            <Radio.Button value="year">This Year</Radio.Button>
                        </Radio.Group>
                    </div>
                </div>
            </div>

            <div style={responsiveStyles.tableWrapper}>
                <Table
                    dataSource={filterLeadsByDate(leads)}
                    columns={orderedColumns}
                    size="middle"
                    tableLayout="fixed"
                    // loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 8,
                        total: filterLeadsByDate(leads)?.length,
                        showTotal: (total) => `Total ${total} leads`,
                        showSizeChanger: false,
                        hideOnSinglePage: true,
                        style: {
                            marginTop: '12px',
                            padding: '8px 16px',
                            background: '#f8fafc',
                            borderRadius: '0 0 8px 8px'
                        }
                    }}
                    style={{
                        borderRadius: '8px',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        width: '100%'
                    }}
                    className="white-label-table fixed-height-table"
                    onRow={(record) => ({
                        onClick: () => navigate(`/dashboard/crm/leads/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                    scroll={{ x: '980px', y: 'hidden' }}
                    locale={{
                        emptyText: (
                            <div style={{
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Text type="secondary">No leads found</Text>
                            </div>
                        )
                    }}
                />
            </div>
        </Card>
    );
};

export default LeadsTable; 