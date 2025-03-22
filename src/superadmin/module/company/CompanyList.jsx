import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal } from 'antd';
import { FiEye, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import moment from 'moment';
import EditCompany from './EditCompany';

const CompanyList = ({ companies, loading, onView, onEdit, onDelete }) => {
    
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);




    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Company',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Company',
                danger: true,
                onClick: () => onDelete(record),
            }
        ]
    });

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            render: (text) => (
                <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            ),
            width: '20%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => (
                text && text !== 'N/A' ? (
                    <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
                        {text}
                    </a>
                ) : 'N/A'
            ),
            width: '25%',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => text || 'N/A',
            width: '15%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const currentStatus = status || 'inactive';
                const color = currentStatus === 'active' ? 'success' : 'error';
                return <Tag color={color}>{currentStatus.toUpperCase()}</Tag>;
            },
            width: '10%',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
            sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
            width: '15%',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="plan-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
            width: '80px',
            fixed: 'right'
        },
    ];

    return (
        <>
            <Table
                dataSource={companies}
                columns={columns}
                rowKey={record => record.id}
                loading={loading}
                scroll={{ x: 1100 }}
                pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: companies.length,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    onChange: (page) => setCurrentPage(page)
                }}
            />

            {editModalVisible && (
                <EditCompany
                    visible={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                    }}
                    onComplete={(updatedCompany) => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                        if (onEdit) {
                            onEdit(updatedCompany);
                        }
                    }}
                    initialValues={selectedCompany}
                    loading={loading}
                />
            )}
        </>
    );
};

export default CompanyList; 