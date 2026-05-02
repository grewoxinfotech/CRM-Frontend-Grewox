import React from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Tooltip,
    message,
    Dropdown,
    Typography
} from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiLink,
    FiEye,
    FiFileText,
    FiMoreVertical
} from 'react-icons/fi';
import { QrcodeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const CustomFormList = ({ data = [], onEdit, onDelete, loading }) => {
    const navigate = useNavigate();

    const copyLink = (formId) => {
        const formUrl = `${window.location.origin}/forms/${formId}`;
        navigator.clipboard.writeText(formUrl);
        message.success('Link copied to clipboard!');
    };

    const columns = [
        {
            title: 'Form Name',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                        <FiFileText size={14} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.event_name}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'event_location',
            key: 'event_location',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Tag color="blue" style={{ borderRadius: '4px', border: 'none', fontSize: '11px', width: 'fit-content' }}>
                        {dayjs(record.start_date).format('DD MMM')} - {dayjs(record.end_date).format('DD MMM YYYY')}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'submissions', icon: <FiEye />, label: 'Submissions', onClick: () => navigate(`/dashboard/crm/custom-form/${record.id}/submissions`) },
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit Form', onClick: () => onEdit(record) },
                            { key: 'copy', icon: <FiLink />, label: 'Copy Link', onClick: () => copyLink(record.id) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="custom-form-list-container">
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                size="small"
                className="compact-table"
                pagination={{
                    showTotal: (total) => `Total ${total} items`,
                    pageSize: 10
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default CustomFormList;