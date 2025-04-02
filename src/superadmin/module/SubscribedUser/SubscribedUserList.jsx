import React, { useCallback, useState } from 'react';
import { Table, Button, Tag, Dropdown, message, Switch, Popconfirm } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetAllSubscribedUsersQuery } from './services/SubscribedUserApi';
import moment from 'moment'; // Import moment for date formatting
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useGetAllCompaniesQuery, useRemovePlanMutation } from '../company/services/companyApi';

const SubscribedUserList = ({ onEdit, onDelete, onView }) => {
    const { data: subscribedUsersData, isLoading } = useGetAllSubscribedUsersQuery();
    const { data: companiesData } = useGetAllCompaniesQuery();
    const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
    const { data: plansData } = useGetAllPlansQuery(filters);
    const [removePlan] = useRemovePlanMutation();

    // Ensure we have an array of users, even if empty
    const users = React.useMemo(() => {
        if (!subscribedUsersData) return [];
        return Array.isArray(subscribedUsersData) ? subscribedUsersData : subscribedUsersData.data || [];
    }, [subscribedUsersData]);

    // Memoized function to get plan name with null check
    const getPlanName = useCallback((planId) => {
        if (!plansData?.data) return 'N/A';
        const plan = plansData.data.find(plan => plan.id === planId);
        return plan ? plan.name : 'N/A';
    }, [plansData]);

    // Memoized function to get company name with null check
    const getCompanyName = useCallback((companyId) => {
        if (!companiesData?.data) return 'N/A';
        const company = companiesData.data.find(company => company.id === companyId);
        return company ? (company.company_name || company.username || 'N/A') : 'N/A';
    }, [companiesData]);

    const handleStatusChange = async (record) => {
        try {
            await removePlan(record.id).unwrap();
            message.success('Subscription status updated successfully');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update subscription status');
        }
    };

    const columns = [
        {
            title: 'Plan Name',
            dataIndex: 'plan_id',
            key: 'plan_id',
            render: (planId) => getPlanName(planId),
            sorter: (a, b) => {
                const planNameA = getPlanName(a.plan_id) || '';
                const planNameB = getPlanName(b.plan_id) || '';
                return planNameA.localeCompare(planNameB);
            }
        },
        {
            title: 'Client Name',
            dataIndex: 'client_id', // or 'company_id' depending on your API response
            key: 'client_id',
            render: (clientId) => getCompanyName(clientId),
            sorter: (a, b) => {
                const companyNameA = getCompanyName(a.client_id) || '';
                const companyNameB = getCompanyName(b.client_id) || '';
                return companyNameA.localeCompare(companyNameB);
            }
        },
        {
            title: 'Total Client Count',
            dataIndex: 'current_clients_count',
            key: 'current_clients_count',
            sorter: (a, b) => (a.current_clients_count || 0) - (b.current_clients_count || 0),
            render: (count) => count || 0
        },
        {
            title: 'Total Storage Used',
            dataIndex: 'current_storage_used',
            key: 'current_storage_used',
            sorter: (a, b) => (a.current_storage_used || 0) - (b.current_storage_used || 0),
            render: (storage) => `${storage || 0} GB`
        },
        {
            title: 'Total Users Count',
            dataIndex: 'current_users_count',
            key: 'current_users_count',
            sorter: (a, b) => (a.current_users_count || 0) - (b.current_users_count || 0),
            render: (count) => count || 0
        },
        {
            title: 'Payment Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status) => {
                let color = 'blue';
                switch (status?.toLowerCase()) {
                    case 'paid':
                        color = 'green';
                        break;
                    case 'unpaid':
                        color = 'red';
                        break;
                    case 'pending':
                        color = 'orange';
                        break;
                    default:
                        color = 'blue';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status?.replace(/_/g, ' ') || 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Popconfirm
                    title={record.status !== 'cancelled' ? 
                        "Deactivate Subscription?" : 
                        "Subscription is inactive"}
                    description={record.status !== 'cancelled' ? 
                        "This will prevent the company from accessing their account." : 
                        "This subscription is no longer active."}
                    onConfirm={() => handleStatusChange(record)}
                    okText="Yes"
                    cancelText="No"
                    disabled={record.status === 'cancelled'}
                >
                    <Switch
                        checked={record.status !== 'cancelled'}
                        className={`status-switch ${record.status !== 'cancelled' ? 'active' : 'inactive'}`}
                        disabled={record.status === 'cancelled'}
                    />
                </Popconfirm>
            )
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
            render: (date) => moment(date).format('DD MMM YYYY')
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
            render: (date) => moment(date).format('DD MMM YYYY')
        },
       
    ];

    // Transform the users data to ensure each row has a unique key
    const tableData = React.useMemo(() => {
        return users.map(user => ({
            ...user,
            key: user.id
        }));
    }, [users]);

    // Add loading state to table
    return (
        <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="custom-table"
            scroll={{ x: 1500 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default SubscribedUserList;
