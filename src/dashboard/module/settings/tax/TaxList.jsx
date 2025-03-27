import React from 'react';
import { Table, Button, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetAllTaxesQuery } from './services/taxApi';

const TaxList = ({ onEdit, onDelete, onView }) => {
    const { data: taxesData, isLoading } = useGetAllTaxesQuery();

    // Ensure we have an array of taxes, even if empty
    const taxes = React.useMemo(() => {
        if (!taxesData) return [];
        return Array.isArray(taxesData) ? taxesData : taxesData.data || [];
    }, [taxesData]);

    // Define action items for dropdown
    const getActionItems = (record) => [
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Tax',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Tax',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'GST Name',
            dataIndex: 'gstName',
            key: 'gstName',
            sorter: (a, b) => (a.gstName || '').localeCompare(b.gstName || '')
        },
        {
            title: 'GST Percentage',
            dataIndex: 'gstPercentage',
            key: 'gstPercentage',
            render: (percentage) => `${percentage}%`
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ 
                        items: getActionItems(record)
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical className="text-lg" />}
                        className="action-button"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    // Transform the taxes data to ensure each row has a unique key
    const tableData = React.useMemo(() => {
        return taxes.map(tax => ({
            ...tax,
            key: tax.id
        }));
    }, [taxes]);

    return (
        <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} taxes`,
            }}
            className="custom-table"
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default TaxList;
