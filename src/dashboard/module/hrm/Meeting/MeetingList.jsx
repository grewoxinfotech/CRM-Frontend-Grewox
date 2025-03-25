import React from 'react';
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import dayjs from 'dayjs';

const MeetingList = ({ meetings, loading, onEdit, onDelete }) => {

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Meeting',
            content: 'Are you sure you want to delete this meeting?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await onDelete(id);
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete meeting');
                }
            },
        });
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onEdit(record),
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
                onClick: () => handleDelete(record.id),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Meeting Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        
        },
        {
            title: 'Meeting Date',
            dataIndex: 'date', 
            key: 'date',
            sorter: (a, b) => {
                if (!a.date || !b.date) return 0;
                return dayjs(a.date).unix() - dayjs(b.date).unix();
            },
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '-'
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            sorter: (a, b) => {
                if (!a.startTime || !b.startTime) return 0;
                return dayjs(a.startTime, 'HH:mm').unix() - dayjs(b.startTime, 'HH:mm').unix();
            },
           
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            sorter: (a, b) => {
                if (!a.endTime || !b.endTime) return 0;
                return dayjs(a.endTime, 'HH:mm').unix() - dayjs(b.endTime, 'HH:mm').unix();
            },
           
        },
        {
            title: 'Meeting Link',
            dataIndex: 'meetingLink',
            key: 'meetingLink',
            sorter: (a, b) => {
                if (!a.meetingLink || !b.meetingLink) return 0;
                return a.meetingLink.localeCompare(b.meetingLink);
            },
          
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => {
                if (!a.description || !b.description) return 0;
                return a.description.localeCompare(b.description);
            },
          
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            sorter: (a, b) => {
                if (!a.department || !b.department) return 0;
                return a.department.localeCompare(b.department);
            },
          
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status) => {
                const color = status === 'scheduled' ? 'blue' : 
                             status === 'completed' ? 'green' : 
                             status === 'cancelled' ? 'red' : 'gold';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
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
                    overlayClassName="department-actions-dropdown"
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
        <Table
            columns={columns}
            dataSource={meetings?.map(meeting => ({
                ...meeting,
                key: meeting.id,
                date: dayjs.isDayjs(meeting.date) ? meeting.date : dayjs(meeting.date)
            }))}
            loading={loading}
            rowKey="id"
            pagination={{
                total: meetings?.length || 0,
                pageSize: 10,
                showTotal: (total) => `Total ${total} meetings`,
                showSizeChanger: true,
                showQuickJumper: true,
                size: 'default',
                position: ['bottomRight']
            }}
        />
    );
};

export default MeetingList;