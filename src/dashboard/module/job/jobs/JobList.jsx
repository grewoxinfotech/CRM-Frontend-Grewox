import React from "react";
import { Table, Button, Tag, Dropdown, Typography, Space } from "antd";
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiBriefcase,
} from "react-icons/fi";
import dayjs from "dayjs";

const { Text } = Typography;

const JobList = ({ jobs = [], onEdit, onDelete, loading, pagination }) => {
    const columns = [
        {
            title: "Job Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <FiBriefcase size={12} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.category} • {record.location}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Type",
            dataIndex: "jobType",
            key: "jobType",
            render: (type) => <Tag style={{ borderRadius: '4px', border: 'none' }}>{type?.toUpperCase()}</Tag>
        },
        {
            title: "Openings",
            dataIndex: "totalOpenings",
            key: "totalOpenings",
            align: 'center',
            render: (count) => <Text strong style={{ fontSize: '13px' }}>{count}</Text>
        },
        {
            title: "Salary",
            dataIndex: "expectedSalary",
            key: "expectedSalary",
            render: (salary, record) => <Text strong style={{ color: '#059669', fontSize: '13px' }}>{record.currency} {salary}</Text>
        },
        {
            title: "Posted",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'error'} style={{ borderRadius: '4px', border: 'none' }}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record.id) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            )
        }
    ];

    return (
        <div className="job-list-container">
            <Table
                columns={columns}
                dataSource={jobs}
                rowKey="id"
                loading={loading}
                size="small"
                className="compact-table"
                pagination={{
                    ...pagination,
                    showTotal: (total) => `Total ${total} items`
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default JobList;