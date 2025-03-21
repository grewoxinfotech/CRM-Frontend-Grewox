import React from 'react';
import { Table, Tag, Dropdown, Button } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';

const OfferLetterList = ({ offerLetters, onEdit, onDelete, onView, loading }) => {
    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => onView(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const columns = [
        {
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            sorter: (a, b) => (a.job || '').localeCompare(b.job || '')
        },
        {
            title: 'Job Application',
            dataIndex: 'job_application',
            key: 'job_application',
            sorter: (a, b) => (a.job_application || '').localeCompare(b.job_application || '')
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            sorter: (a, b) => (a.salary || '').localeCompare(b.salary || '')
        },
        {   
            title: 'Expected Joining Date',
            dataIndex: 'expected_joining_date',
            key: 'expected_joining_date',
            render: (date) => date ? moment(date).format('DD MMM YYYY') : '-'
        },
        {
            title: 'Offer Expiry Date',
            dataIndex: 'offer_expiry',
            key: 'offer_expiry',
            render: (date) => date ? moment(date).format('DD MMM YYYY') : '-'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-',
            sorter: (a, b) => (a.description || '').localeCompare(b.description || '')
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={offerLetters}
            loading={loading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} offer letters`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default OfferLetterList; 