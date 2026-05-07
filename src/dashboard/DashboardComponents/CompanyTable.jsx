import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio } from 'antd';
import { FiBriefcase } from 'react-icons/fi';

const { Text } = Typography;

const CompanyTable = ({
    companies,
    loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterCompaniesByDate = (companies) => {
        if (!companies) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return companies.filter(company => {
            const companyDate = new Date(company.createdAt);
            switch (dateFilter) {
                case 'today': return companyDate >= today;
                case 'month': return companyDate >= firstDayOfMonth;
                case 'year': return companyDate >= firstDayOfYear;
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Company Name",
            key: "company_name",
            width: 220,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#14b8a6', fontSize: '10px' }}>
                        {record?.company_name ? record.company_name[0].toUpperCase() : 'C'}
                    </Avatar>
                    <Text strong style={{ fontSize: '13px' }}>
                        {record.company_name}
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
            dataIndex: "phone_number",
            key: "phone_number",
            render: (phone_number) => <Text style={{ fontSize: '13px' }}>{phone_number || '-'}</Text>
        },
        {
            title: "Website",
            dataIndex: "website",
            key: "website",
            render: (website) => <Text style={{ fontSize: '13px' }}>{website || '-'}</Text>
        }
    ];

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#14b8a6', p: '6px', borderRadius: '6px', display: 'flex', padding: '4px' }}>
                        <FiBriefcase style={{ color: 'white' }} />
                    </div>
                    <Text strong style={{ fontSize: '15px' }}>Company Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{companies?.length || 0}</Tag>
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
                dataSource={filterCompaniesByDate(companies)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                loading={loading}
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/crm/companyaccount/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default CompanyTable;
