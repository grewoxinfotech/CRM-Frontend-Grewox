import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Modal, Spin, Alert } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiUser, FiPhone } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';
import { message } from 'antd';
import EditVendor from './EditVendor';

const { Text } = Typography;

const VendorList = ({  onEdit, onDelete, onView, loading }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const { data, isLoading, isError } = useGetVendorsQuery();
    const [deleteVendor] = useDeleteVendorMutation();

    const vendors = data?.data || [];

 

    if (isError) {
        return <Alert type="error" message="Failed to fetch vendors" />;
    }

    // const handleEdit = (record) => {
    //     setSelectedVendorId(record.id);
    //     setSelectedVendor(record);
    //     setIsEditModalVisible(true);
    // };

    const handleCancel = () => {
        setIsEditModalVisible(false);
        setSelectedVendorId(null);
        setSelectedVendor(null);
    };

    // const handleDelete = async (record) => {
    //     Modal.confirm({
    //         title: 'Delete Vendor',
    //         content: 'Are you sure you want to delete this vendor?',
    //         okText: 'Yes',
    //         okType: 'danger',
    //         cancelText: 'No',
    //         bodyStyle: {
    //             padding: '20px',
    //         },
    //         onOk: async () => {
    //             try {
    //                 await deleteVendor(record.id).unwrap();
    //                 message.success('Vendor deleted successfully');
    //             } catch (error) {
    //                 message.error('Failed to delete vendor');
    //             }
    //         },
    //     });
    // };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => console.log('View', record._id),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(record),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Vendor Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUser style={{ color: '#1890ff' }} />
                    <Text>{name}</Text>
                </div>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPhone style={{ color: '#1890ff' }} />
                    <Text>{contact}</Text>
                </div>
            ),
            sorter: (a, b) => (a?.contact || '').localeCompare(b?.contact || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            sorter: (a, b) => (a?.email || '').localeCompare(b?.email || ''),
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            sorter: (a, b) => (a?.city || '').localeCompare(b?.city || ''),
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            sorter: (a, b) => (a?.state || '').localeCompare(b?.state || ''),
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            sorter: (a, b) => (a?.country || '').localeCompare(b?.country || ''),
        },
        {
            title: 'Action',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="vendor-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <div className="vendor-list">
                <Table
                    columns={columns}
                    dataSource={vendors}
                    rowKey="_id"
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} vendors`,
                    }}
                    className="vendor-table"
                />
            </div>

            {/* <EditVendor 
                vendorId={selectedVendorId}
                visible={isEditModalVisible}
                onCancel={handleCancel}
                initialValues={selectedVendor}
            /> */}
        </>
    );
};

export default VendorList;