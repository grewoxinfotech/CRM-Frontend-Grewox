import React from 'react';
import {
    Table, Empty, Tag, Button, Tooltip,
    Typography, Space, Spin, Input, Dropdown
} from 'antd';
import {
    FiTrash2,
    FiCalendar, FiEye,
    FiMoreVertical
} from 'react-icons/fi';
import moment from 'moment';

const { Text } = Typography;

const ESignatureList = ({ signatures, onEdit, onDelete, onDownload, loading }) => {
    if (loading) {
        return (
            <div className="signatures-loading">
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 16 }}>Loading signatures...</Text>
            </div>
        );
    }

    if (!signatures || signatures.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <div>
                        <p>No signatures found</p>
                        <Text type="secondary">Create your first signature to get started</Text>
                    </div>
                }
            />
        );
    }

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'download',
                icon: <FiEye />,
                label: 'Download',
                onClick: () => onDownload(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                danger: true,
                onClick: () => onDelete(record.id),
            }
        ]
    });

    const columns = [
        {
            title: 'Signature Preview',
            dataIndex: 'e_signatures',
            key: 'e_signatures',
            sorter: (a, b) => a.e_signatures.localeCompare(b.e_signatures),
            render: (data, record) => (
                <div className="signature-preview">
                    <img
                        src={data}
                        alt={`Signature: ${record.esignature_name}`}
                        className="signature-thumb"
                    />
                </div>
            )
        },
        {
            title: 'Name',
            dataIndex: 'esignature_name',
            key: 'esignature_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search signature name"
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
                record.esignature_name.toLowerCase().includes(value.toLowerCase()),
            render: (text) => <Text strong>{text}</Text>,
            
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type),
            render: (type) => (
                <Tag color={type === 'draw' ? 'blue' : 'purple'}>
                    {type === 'draw' ? 'Hand Drawn' : 'Uploaded'}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Tooltip title={moment(date).format('MMMM DD, YYYY, h:mm A')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar />
                        <span>{moment(date).format('MMM DD, YYYY')}</span>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width:80,
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="signature-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical className="action-icon" />}
                            className="action-button more"
                        />
                    </Dropdown>
                </div>
            )
        }
    ];

    return (
        <div className="signature-list">
            <Table
                columns={columns}
                dataSource={signatures}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    showQuickJumper: false
                }}
                className="signatures-table"
                loading={loading}
                scroll={{x: 1000,y: ""}}
            />
        </div>
    );
};

ESignatureList.defaultProps = {
    loading: false
};

export default ESignatureList;
