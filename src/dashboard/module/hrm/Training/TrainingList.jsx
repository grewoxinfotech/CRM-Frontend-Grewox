import React, { useMemo } from 'react';
import { Table, Space, Button, Tooltip, Modal, message, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiLink, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetAllTrainingsQuery, useDeleteTrainingMutation } from './services/trainingApi';
import dayjs from 'dayjs';
import moment from 'moment';

const TrainingList = ({ trainings, loading, onEdit, onDelete, onView, searchText }) => {
    const { data: trainingsData, isLoading } = useGetAllTrainingsQuery();
    const [deleteTraining] = useDeleteTrainingMutation();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Training',
            content: 'Are you sure you want to delete this training?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteTraining(id).unwrap();
                    message.success('Training deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete training');
                }
            },
        });
    };

    // Filter trainings based on search text
    const filteredTrainings = useMemo(() => {
        if (!trainings) return [];
        
        if (!searchText) return trainings;

        const searchLower = searchText.toLowerCase();
        return trainings.filter(training => {
            const title = training.title?.toLowerCase() || '';
            return title.includes(searchLower);
        });
    }, [trainings, searchText]);

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (title) => (
                <span className="text-base" style={{ 
                    color: searchText && title.toLowerCase().includes(searchText.toLowerCase()) 
                        ? '#1890ff' 
                        : 'inherit' 
                }}>
                    {title}
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type),
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Trainer',
            dataIndex: 'trainer',
            key: 'trainer',
            render: (trainer) => <span className="text-base">{trainer}</span>,
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            sorter: (a, b) => moment(a.start_date).unix() - moment(b.start_date).unix(),
            render: (date) => (
                <span className="text-base">
                    {moment(date).format('DD-MM-YYYY')}
                </span>
            ),
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            sorter: (a, b) => moment(a.end_date).unix() - moment(b.end_date).unix(),
            render: (date) => (
                <span className="text-base">
                    {moment(date).format('DD-MM-YYYY')}
                </span>
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
                        onClick: () => onView(record),
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
                        onClick: () => onDelete(record),
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items }}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="training-actions-dropdown"
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
        <div className="training-list">
            <Table
                columns={columns}
                dataSource={filteredTrainings}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="training-table"
            />
        </div>
    );
};

export default TrainingList; 