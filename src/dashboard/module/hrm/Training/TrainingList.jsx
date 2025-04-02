import React, { useMemo } from 'react';
import { Table, Space, Button, Tooltip, Modal, message, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiLink, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetAllTrainingsQuery, useDeleteTrainingMutation } from './services/trainingApi';
import dayjs from 'dayjs';

const TrainingList = ({ onView, onEdit, searchText = '', filters = {} }) => {
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

    // Transform and filter trainings data with safe checks
    const trainings = useMemo(() => {
        let filteredData = [];
        
        // Safely extract data array
        if (trainingsData?.data) {
            filteredData = trainingsData.data;
        } else if (Array.isArray(trainingsData)) {
            filteredData = trainingsData;
        }

        // Apply filters with safe checks
        return filteredData.filter(training => {
            if (!training) return false;

            // Safe search text check
            const searchLower = (searchText || '').toLowerCase();
            const categoryLower = (training.category || '').toLowerCase();

            const matchesSearch = !searchText || categoryLower.includes(searchLower);

            // Safe date range check
            const matchesDateRange = !filters?.dateRange?.length || (
                training.created_at && 
                dayjs(training.created_at).isValid() && 
                dayjs(training.created_at).isAfter(filters.dateRange[0]) &&
                dayjs(training.created_at).isBefore(filters.dateRange[1])
            );

            return matchesSearch && matchesDateRange;
        });
    }, [trainingsData, searchText, filters]);

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
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <span className="text-base">{text || '-'}</span>,
            sorter: (a, b) => (a?.category || '').localeCompare(b?.category || ''),
        },
        {
            title: 'Links',
            dataIndex: 'links',
            key: 'links',
            ellipsis: true,
            render: (links) => {
                try {
                    const linksObj = typeof links === 'string' ? JSON.parse(links) : links;
                    return linksObj?.url ? (
                        <Tooltip title={linksObj.url}>
                            <Button
                                type="link"
                                icon={<FiLink />}
                                onClick={() => window.open(linksObj.url, '_blank')}
                            >
                                {linksObj.url}
                            </Button>
                        </Tooltip>
                    ) : '-';
                } catch (error) {
                    return '-';
                }
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
                    overlayClassName="training-actions-dropdown"
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
        <div className="training-list">
            <Table
                columns={columns}
                dataSource={trainings}
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