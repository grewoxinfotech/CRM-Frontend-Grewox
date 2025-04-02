import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tag, message, Modal, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetMeetingsQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from './services/meetingApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import dayjs from 'dayjs';
import CreateMeeting from './CreateMeeting';

const MeetingList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    // API call for getting all meetings
    const { data: meetings, isLoading } = useGetMeetingsQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const [updateMeeting] = useUpdateMeetingMutation();
    const [deleteMeeting] = useDeleteMeetingMutation();

    
    // Create a map of department IDs to names
    const departmentMap = useMemo(() => {
        const map = {};
        if (departmentsData) {
            departmentsData.forEach(dept => {
                if (dept && dept.id) {
                    map[dept.id] = dept.department_name;
                }
            });
        }
        return map;
    }, [departmentsData]);

    // Handle edit
    const handleEdit = (record) => {
        // Format the dates before setting them in the form
        const formattedRecord = {
            ...record,
            date: record.date && dayjs(record.date),
            startTime: record.startTime && dayjs(record.startTime, 'HH:mm'),
            endTime: record.endTime && dayjs(record.endTime, 'HH:mm'),
        };
        setEditingMeeting(formattedRecord);
        setIsModalOpen(true);
    };

    // Handle delete
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Meeting',
            content: 'Are you sure you want to delete this meeting?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteMeeting(id).unwrap();
                    message.success('Meeting deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete meeting');
                }
            },
        });
    };

    // Handle update
    const handleUpdate = async (values) => {
        try {
            const formattedValues = {
                ...values,
                // Use proper dayjs validation and formatting
                date: values.date && dayjs(values.date).format('YYYY-MM-DD'),
                startTime: values.startTime && dayjs(values.startTime).format('HH:mm'),
                endTime: values.endTime && dayjs(values.endTime).format('HH:mm'),
                client_id: localStorage.getItem('client_id'),
            };

            await updateMeeting({
                id: editingMeeting.id,
                data: formattedValues
            }).unwrap();

            message.success('Meeting updated successfully');
            setIsModalOpen(false);
            setEditingMeeting(null);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update meeting');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (departmentId) => (
                <span style={{ color: '#4b5563' }}>
                    {departmentMap[departmentId] || 'N/A'}
                </span>
            ),
            sorter: (a, b) => {
                const deptA = departmentMap[a.department] || '';
                const deptB = departmentMap[b.department] || '';
                return deptA.localeCompare(deptB);
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            sorter: (a, b) => a.startTime.localeCompare(b.startTime),
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            sorter: (a, b) => a.endTime.localeCompare(b.endTime),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status) => (
                <Tag color={
                    status === 'scheduled' ? 'blue' :
                    status === 'completed' ? 'green' : 'red'
                }>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        icon: <FiEye style={{ fontSize: '14px' }} />,
                        label: 'View',
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'edit',
                        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
                        label: 'Edit',
                        onClick: () => handleEdit(record),
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
                        overlayClassName="meeting-actions-dropdown"
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
        <div style={{ padding: '24px' }}>
            

            <Table 
                columns={columns}
                dataSource={meetings?.data || []}
                loading={isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    total: meetings?.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} meetings`,
                    showQuickJumper: true,
                    size: "default",
                    position: ["bottomRight"],
                }}
            />

            {/* Edit Modal */}
            <CreateMeeting
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingMeeting(null);
                }}
                onSubmit={handleUpdate}
                initialValues={editingMeeting}
                isEditing={true}
            />
        </div>
    );
};

export default MeetingList;