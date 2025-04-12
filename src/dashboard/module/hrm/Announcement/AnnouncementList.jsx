import React from 'react';
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message, Input } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import { useDeleteAnnouncementMutation } from './services/announcementApi';

const AnnouncementList = ({ announcements, loading, onEdit }) => {
    const { data: branchesData, isLoading: branchesLoading } = useGetAllBranchesQuery();
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Announcement',
            content: 'Are you sure you want to delete this announcement?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteAnnouncement(id).unwrap();
                    message.success('Announcement deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete announcement');
                }
            },
        });
    };

    const getBranchName = (branchId) => {
        const branch = branchesData?.data?.find(branch => branch.id === branchId);
        return branch ? branch.branchName : branchId;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search announcement title"
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
                record.title.toLowerCase().includes(value.toLowerCase()) ||
                record.branch?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => <span className="text-base">{text}</span>,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                        placeholder="Search branch"
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
                record.branch.toLowerCase().includes(value.toLowerCase()) ||
                record.title?.toLowerCase().includes(value.toLowerCase()),
            render: (branchData) => {
                try {
                    const branchObj = JSON.parse(branchData);
                    if (branchObj.branch && branchObj.branch.length > 0) {
                        return (
                            <Space>
                                {branchObj.branch.map((branchId, index) => (
                                    <Tag key={index}>
                                        {getBranchName(branchId)}
                                    </Tag>
                                ))}
                            </Space>
                        );
                    }
                    return <Tag color="red">No Branch</Tag>;
                } catch (error) {
                    console.error('Error parsing branch data:', error);
                    return <Tag color="red">Invalid Branch Data</Tag>;
                }
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => a.date.localeCompare(b.date),
            render: (text) => <span className="text-base">{moment(text).format('DD-MM-YYYY')}</span>,
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            sorter: (a, b) => a.time.localeCompare(b.time),
            render: (text) => <span className="text-base">{text}</span>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            render: (text) => (
                <Tooltip title={text}>
                    <span className="text-base" style={{ color: '#4b5563' }}>
                        {text.length > 50 ? `${text.substring(0, 50)}...` : text}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        icon: <FiEye style={{ fontSize: '14px' }} />,
                        label: 'View',
                        onClick: () => onEdit(record),
                    },
                    {
                        key: 'edit',
                        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
                        label: 'Edit',
                        onClick: () => onEdit(record),
                    },
                    {
                        key: 'delete',
                        icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                        label: 'Delete',
                        danger: true,
                        onClick: () => handleDelete(record.id),
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items }}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="announcement-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="action-dropdown-button"
                            onClick={(e) => e.preventDefault()}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="announcement-list">
            <Table
                columns={columns}
                dataSource={announcements}
                loading={loading || branchesLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="announcement-table"
            />
        </div>
    );
};

export default AnnouncementList; 