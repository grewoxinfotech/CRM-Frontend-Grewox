import React from 'react';
import { 
    Table, Empty, Tag, Button, Tooltip,
    Typography, Space, Spin
} from 'antd';
import {
     FiTrash2, 
    FiCalendar,FiEye
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

    const columns = [
        {
            title: 'Signature Preview',
            dataIndex: 'e_signatures',
            key: 'e_signatures',
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
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.name.localeCompare(b.esignature_name)
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
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
            render: (_, record) => (
                <Space size="small" className="action-buttons">
                    {/* <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => onEdit(record)}
                            className="action-button edit"
                        />
                    </Tooltip> */}
                    <Tooltip title="Download">
                        <Button
                            type="text"
                            icon={<FiEye  />}
                            onClick={() => onDownload(record)}
                            className="action-button download"
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => onDelete(record.id)}
                            className="action-button delete"
                        />
                    </Tooltip>
                </Space>
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
            />
        </div>
    );
};

ESignatureList.defaultProps = {
    loading: false
};

export default ESignatureList;
