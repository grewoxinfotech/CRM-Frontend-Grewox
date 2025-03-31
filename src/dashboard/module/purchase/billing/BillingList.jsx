import React from 'react';
import { Table, Button, Dropdown, Menu, Tag } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useGetVendorsQuery } from './services/billingApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
const BillingList = ({ billings, onEdit, onDelete, onView, searchText, loading }) => {
    // Fetch vendors data
    const { data: vendorsData } = useGetVendorsQuery();

    const { data: currenciesData } = useGetAllCurrenciesQuery({});




    // Create a map of vendor IDs to vendor names
    const vendorMap = React.useMemo(() => {
        if (!vendorsData?.data) return {};
        return vendorsData.data.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.name;
            return acc;
        }, {});
    }, [vendorsData]);

    // Create a map of currency IDs/codes to currency icons
    const currencyMap = React.useMemo(() => {
        if (!currenciesData) return {};
        return currenciesData.reduce((acc, currency) => {
            acc[currency.id] = currency.currencyIcon;
            acc[currency.currencyCode] = currency.currencyIcon; // Also map by code
            return acc;
        }, {});
    }, [currenciesData]);

    const columns = [
        {
            title: 'Bill Number',
            dataIndex: 'billNumber',
            key: 'billNumber',
            render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor',
            key: 'vendor',
            render: (vendorId) => {
                const vendorName = vendorMap[vendorId] || 'Unknown Vendor';
                return <span>{vendorName}</span>;
            }
        },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (amount, record) => {
                const currencyIcon = currencyMap[record.currency] || '₹';
                return (
                    <span style={{ fontWeight: '500', color: '#1890ff' }}>
                        {currencyIcon}{Number(amount).toLocaleString()}
                    </span>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                switch (status?.toLowerCase()) {
                    case 'paid':
                        color = 'success';
                        break;
                    case 'pending':
                        color = 'warning';
                        break;
                    case 'overdue':
                        color = 'error';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item 
                                key="view" 
                                icon={<FiEye />}
                                onClick={() => onView(record)}
                            >
                                View
                            </Menu.Item>
                            <Menu.Item 
                                key="edit" 
                                icon={<FiEdit2 />}
                                onClick={() => onEdit(record)}
                            >
                                Edit
                            </Menu.Item>
                            <Menu.Item 
                                key="delete" 
                                icon={<FiTrash2 />}
                                danger
                                onClick={() => onDelete(record)}
                            >
                                Delete
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button 
                        type="text" 
                        icon={<FiMoreVertical />}
                        style={{ padding: 4 }}
                    />
                </Dropdown>
            ),
        },
    ];

    // Filter billings based on search text
    const filteredBillings = billings?.filter(bill => 
        bill.billNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        vendorMap[bill.vendor]?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Table
            columns={columns}
            dataSource={filteredBillings}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            // style={{ marginTop: 16 }}
        />
    );
};

export default BillingList;