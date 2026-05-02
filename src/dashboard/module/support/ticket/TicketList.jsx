import React, { useCallback } from 'react';
import { Table, Tag, Dropdown, Button, Typography } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';
import { useGetEmployeesQuery } from '../../hrm/Employee/services/employeeApi';

const { Text } = Typography;

const TicketList = ({ tickets, onEdit, onDelete, loading }) => {
    const { data: employeesData } = useGetEmployeesQuery();
    
    const employeesMap = React.useMemo(() => {
        const list = Array.isArray(employeesData) ? employeesData : employeesData?.data || [];
        const map = {};
        list.forEach(emp => { map[emp.id] = emp.name || emp.email; });
        return map;
    }, [employeesData]);
    
    const getEmployeeName = useCallback((id) => id ? employeesMap[id] || 'N/A' : 'N/A', [employeesMap]);

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'ticketSubject',
            key: 'subject',
            width: 250,
            render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        },
        {
            title: 'Requester',
            dataIndex: 'requestor',
            key: 'requestor',
            width: 150,
            render: (id) => <Tag color="blue" style={{ borderRadius: '4px', border: 'none' }}>{getEmployeeName(id)}</Tag>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = 'default';
                if (status === 'open') color = 'processing';
                if (status === 'resolved') color = 'success';
                if (status === 'closed') color = 'default';
                return <Tag color={color} className="status-tag">{status}</Tag>;
            }
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'date',
            width: 150,
            render: (date) => moment(date).format('DD MMM YYYY')
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
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
        <div className="ticket-list-container">
            <Table
                columns={columns}
                dataSource={tickets?.data || []}
                rowKey="id"
                size="small"
                loading={loading}
                className="compact-table"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} tickets`,
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default TicketList;
