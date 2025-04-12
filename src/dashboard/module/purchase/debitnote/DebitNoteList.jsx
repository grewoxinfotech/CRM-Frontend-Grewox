import React from 'react';
import { Table, Button, Dropdown, Typography, Spin, Alert, Menu, Input, Space } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiFileText, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useGetDebitNotesQuery } from './services/debitnoteApi';
import { useSelector } from 'react-redux';
import { useGetBillingsQuery } from '../billing/services/billingApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';

const { Text } = Typography;

const getCompanyId = (state) => {
    const user = state.auth.user;
    return user?.companyId || user?.company_id || user?.id;
};

const DebitNoteList = ({ onEdit, onDelete, onView, data, searchText, loading }) => {
    const companyId = useSelector(getCompanyId);
    const { data: billings, isLoading } = useGetBillingsQuery(companyId);
    const { data: currenciesData } = useGetAllCurrenciesQuery();

    const getBillNumber = (billId) => {
        const foundBill = billings?.data?.find(bill => bill.id === billId);
        return foundBill?.billNumber || 'N/A';
    };

    const getCurrencySymbol = (currencyId) => {
        const currency = currenciesData?.find(curr => curr.id === currencyId);
        return currency?.currencyIcon || '₹';
    };

    const columns = [
        {
            title: 'Bill Number',
            dataIndex: 'bill',
            key: 'bill',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search bill number"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.bill.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (billId) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiFileText style={{ color: '#1890ff' }} />
                    <Text>{getBillNumber(billId)}</Text>
                </div>
            ),
            
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar style={{ color: '#1890ff' }} />
                    <Text>{new Date(date).toLocaleDateString()}</Text>
                </div>
            ),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text style={{ fontWeight: '500', color: '#1890ff' }}>
                        {getCurrencySymbol(record.currency)}{Number(amount).toLocaleString()}
                    </Text>
                </div>
            ),
            sorter: (a, b) => Number(a.amount) - Number(b.amount),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
       
    ];

    // Filter debit notes based on search text
    const filteredDebitNotes = data?.data?.filter(note => 
        getBillNumber(note.bill)?.toLowerCase().includes(searchText?.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchText?.toLowerCase()) ||
        note.amount?.toString().includes(searchText)
    ) || [];

    return (
        <div className="debitnote-list">
            <Table
                columns={columns}
                dataSource={filteredDebitNotes}
                rowKey="_id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} debit notes`,
                }}
                className="debitnote-table"
            />
        </div>
    );
};

export default DebitNoteList;