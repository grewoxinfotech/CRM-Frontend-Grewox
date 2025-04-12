import React from 'react';
import { Table, Button, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';

const TaxList = ({ taxes, loading, onEdit, onDelete, onView, searchText }) => {
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

    const highlightText = (text, highlight) => {
        if (!highlight.trim() || !text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} style={{ backgroundColor: '#bae7ff' }}>
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const columns = [
        {
            title: 'GST Name',
            dataIndex: 'gstName',
            key: 'gstName',
            sorter: (a, b) => (a.gstName || '').localeCompare(b.gstName || ''),
            render: (text) => highlightText(text, searchText)
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

    return (
        <Table
            columns={columns}
            dataSource={taxes}
            loading={loading}
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
