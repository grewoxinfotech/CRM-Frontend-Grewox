import React from 'react';
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiCalendar,
} from 'react-icons/fi';
import { useGetAllHolidaysQuery, useDeleteHolidayMutation } from './services/holidayApi';
import dayjs from 'dayjs';

const { Text } = Typography;

const HolidayList = ({ onEdit, searchText = '', loading: parentLoading }) => {
    const { data: response = {}, isLoading: localLoading } = useGetAllHolidaysQuery({
        search: searchText,
    });
    const [deleteHoliday] = useDeleteHolidayMutation();

    const holidays = response.data || [];
    const loading = parentLoading || localLoading;

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Holiday',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await deleteHoliday(id).unwrap();
                    message.success('Deleted successfully');
                } catch (error) {
                    message.error('Failed to delete');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Holiday Name',
            dataIndex: 'holiday_name',
            key: 'holiday_name',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <FiCalendar size={14} />
                    </div>
                    <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'leave_type',
            key: 'leave_type',
            render: (type) => <Tag style={{ borderRadius: '4px', border: 'none' }}>{type ? type.toUpperCase() : 'N/A'}</Tag>
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => {
                const start = dayjs(record.start_date);
                const end = dayjs(record.end_date);
                const days = end.diff(start, 'day') + 1;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '13px' }}>{days} Day{days > 1 ? 's' : ''}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{start.format('DD MMM')} - {end.format('DD MMM YYYY')}</Text>
                    </div>
                );
            }
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
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
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
        <div className='holiday-list-container'>
            <Table
                columns={columns}
                dataSource={holidays}
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

export default HolidayList;