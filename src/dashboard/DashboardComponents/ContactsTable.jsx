import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Space } from 'antd';
import { FiUsers } from 'react-icons/fi';

const { Text } = Typography;

const ContactsTable = ({
    contacts,
    companies,
    loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterContactsByDate = (contacts) => {
        if (!contacts) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return contacts.filter(contact => {
            const contactDate = new Date(contact.createdAt);
            switch (dateFilter) {
                case 'today': return contactDate >= today;
                case 'month': return contactDate >= firstDayOfMonth;
                case 'year': return contactDate >= firstDayOfYear;
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Name",
            key: "name",
            width: 220,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#8b5cf6', fontSize: '10px' }}>
                        {record?.first_name ? record.first_name[0].toUpperCase() : 'C'}
                    </Avatar>
                    <Text strong style={{ fontSize: '13px' }}>
                        {record.first_name} {record.last_name}
                    </Text>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 220,
            render: (email) => <Text style={{ fontSize: '13px' }}>{email || '-'}</Text>
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => <Text style={{ fontSize: '13px' }}>{phone || '-'}</Text>
        },
        {
            title: "Company",
            dataIndex: "company_name",
            key: "company",
            render: (companyId) => {
                const company = companies?.find(c => c.id === companyId);
                const displayCompany = company ? company.company_name : (companyId || 'N/A');
                return (
                    <Tag style={{ borderRadius: '4px', fontSize: '11px', textTransform: 'capitalize' }}>
                        {displayCompany}
                    </Tag>
                );
            }
        }
    ];

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#8b5cf6', p: '6px', borderRadius: '6px', display: 'flex', padding: '4px' }}>
                        <FiUsers style={{ color: 'white' }} />
                    </div>
                    <Text strong style={{ fontSize: '15px' }}>Contact Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{contacts?.length || 0}</Tag>
                </div>
            }
            extra={
                <Radio.Group value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="small">
                    <Radio.Button value="all">All</Radio.Button>
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="month">This Month</Radio.Button>
                </Radio.Group>
            }
        >
            <Table
                dataSource={filterContactsByDate(contacts)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                loading={loading}
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/crm/contact/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default ContactsTable;
