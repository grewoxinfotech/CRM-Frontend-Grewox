import React, { useState, useMemo } from "react";
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message } from "antd";
import {
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiLink,
    FiBookOpen,
    FiFolder,
    FiCalendar,
    FiGlobe
} from "react-icons/fi";
import moment from "moment";
import { useGetAllTrainingsQuery, useDeleteTrainingMutation } from "./services/trainingApi";
import './training.scss';

const TrainingList = ({ loading, onEdit, onView, searchText, trainings }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const { data: trainingsData, isLoading } = useGetAllTrainingsQuery();
    const [deleteTraining] = useDeleteTrainingMutation();
    const data = trainingsData?.data || trainings;

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className="bulk-actions" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    // Filter trainings based on search text
    const filteredTrainings = useMemo(() => {
        if (!data) return [];
        if (!searchText) return data;

        const searchLower = searchText.toLowerCase();
        return data.filter(training => {
            const title = training.title?.toLowerCase() || '';
            const category = training.category?.toLowerCase() || '';
            return title.includes(searchLower) || category.includes(searchLower);
        });
    }, [data, searchText]);

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Trainings' : 'Delete Training';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected trainings?`
            : 'Are you sure you want to delete this training?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteTraining(id).unwrap()));
                        message.success(`${recordOrIds.length} trainings deleted successfully`);
                        setSelectedRowKeys([]);
                    } else {
                        await deleteTraining(recordOrIds).unwrap();
                        message.success('Training deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete training(s)');
                }
            },
        });
    };

    const renderLinks = (linksString) => {
        try {
            const links = JSON.parse(linksString);
            return links.url.map((url, index) => (
                <Tag
                    key={index}
                    color="blue"
                    icon={<FiGlobe size={12} />}
                    style={{ cursor: 'pointer', marginBottom: 4 }}
                    onClick={() => {
                        // Ensure URL has proper protocol
                        const properUrl = url.startsWith('http') ? url : `https://${url}`;
                        window.open(properUrl, '_blank');
                    }}
                >
                    {url}
                </Tag>
            ));
        } catch (e) {
            return null;
        }
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
                            <FiBookOpen className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#262626", fontWeight: 600 }}>{text}</div>
                            <div className="meta">{record.category}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Links",
            dataIndex: "links",
            key: "links",
            render: (links) => (
                <div className="links-wrapper">
                    {renderLinks(links)}
                </div>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
                            <FiCalendar className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name">{moment(date).format('MMM DD, YYYY')}</div>
                            <div className="meta">{moment(date).format('hh:mm A')}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                icon: <FiEye size={14} />,
                                label: 'View',
                                onClick: () => onView(record),
                            },
                            {
                                key: 'edit',
                                icon: <FiEdit2 size={14} />,
                                label: 'Edit',
                                onClick: () => onEdit(record),
                            },
                            {
                                key: 'delete',
                                icon: <FiTrash2 size={14} />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => handleDelete(record.id),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        className="action-button"
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="training-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredTrainings}
                loading={loading || isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="custom-table"
            />
        </div>
    );
};

export default TrainingList; 