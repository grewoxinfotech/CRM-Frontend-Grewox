import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Select, Dropdown, Input } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiCalendar,
    FiClock,
    FiStar
} from 'react-icons/fi';
import { useGetAllHolidaysQuery, useDeleteHolidayMutation } from './services/holidayApi';
import dayjs from 'dayjs';
import './holiday.scss';

const { Option } = Select;

const HolidayList = ({ onEdit, searchText = '', filters = {} }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // RTK Query hooks
    const { data: response = {}, isLoading } = useGetAllHolidaysQuery({
        page: currentPage,
        pageSize,
        search: searchText,
        ...filters
    });
    const [deleteHoliday] = useDeleteHolidayMutation();

    // Define leave types
    const leaveTypes = [
        { text: 'Paid', value: 'paid' },
        { text: 'Unpaid', value: 'unpaid' }
    ];

    // Destructure data and pagination from response
    const { data: holidays = [], pagination = {} } = response;


    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Holidays' : 'Delete Holiday';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected holidays?`
            : 'Are you sure you want to delete this holiday?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    if (isMultiple) {
                        // Handle bulk delete
                        await Promise.all(recordOrIds.map(id => deleteHoliday(id).unwrap()));
                        message.success(`${recordOrIds.length} holidays deleted successfully`);
                        setSelectedRowKeys([]); // Clear selection after delete
                    } else {
                        // Handle single delete
                        await deleteHoliday(recordOrIds).unwrap();
                        message.success('Holiday deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete holiday(s)');
                }
            },
        });
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 />}
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const columns = [
        {
            title: 'Holiday Name',
            dataIndex: 'holiday_name',
            key: 'holiday_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search holiday name"
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
                (record.holiday_name?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (text) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div
                            className="icon-wrapper"
                            style={{
                                color: "#7C3AED",
                                background: "rgba(124, 58, 237, 0.1)"
                            }}
                        >
                            <FiCalendar className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div
                                className="name"
                                style={{
                                    color: "#7C3AED",
                                    fontWeight: 600,
                                    fontSize: "14px"
                                }}
                            >
                                {text || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Leave Type',
            dataIndex: 'leave_type',
            key: 'leave_type',
            filters: leaveTypes,
            onFilter: (value, record) => record.leave_type === value,
            render: (type) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div
                            className="icon-wrapper"
                            style={{
                                color: type === 'paid' ? "#059669" : "#2563EB",
                                background: type === 'paid' ? "rgba(5, 150, 105, 0.1)" : "rgba(37, 99, 235, 0.1)"
                            }}
                        >
                            <FiStar className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div
                                className="name"
                                style={{
                                    color: type === 'paid' ? "#059669" : "#2563EB",
                                    fontWeight: 500,
                                    fontSize: "14px"
                                }}
                            >
                                {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => {
                const start = dayjs(record.start_date);
                const end = dayjs(record.end_date);
                const days = end.diff(start, 'day') + 1;
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div
                                className="icon-wrapper"
                                style={{
                                    color: "#D97706",
                                    background: "rgba(217, 119, 6, 0.1)"
                                }}
                            >
                                <FiClock className="item-icon" />
                            </div>
                            <div className="info-wrapper">
                                <div
                                    className="name"
                                    style={{
                                        color: "#D97706",
                                        fontWeight: 500,
                                        fontSize: "14px"
                                    }}
                                >
                                    {days} day{days > 1 ? 's' : ''}
                                </div>
                                <div className="meta">
                                    {dayjs(record.start_date).format('DD MMM')} - {dayjs(record.end_date).format('DD MMM YYYY')}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
            sorter: (a, b) => {
                const daysA = dayjs(a.end_date).diff(dayjs(a.start_date), 'day') + 1;
                const daysB = dayjs(b.end_date).diff(dayjs(b.start_date), 'day') + 1;
                return daysA - daysB;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '80px',
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    icon: <FiEdit2 style={{ fontSize: '14px', color: '#1890ff' }} />,
                                    label: 'Edit Holiday',
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'delete',
                                    icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                                    label: 'Delete Holiday',
                                    danger: true,
                                    onClick: () => handleDelete(record.id),
                                }
                            ]
                        }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical size={16} />}
                            className="action-button"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            ),
        },
    ];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <BulkActions />
            <div className='holiday-list-container'>
                <Table
                    columns={columns}
                    dataSource={holidays}
                    loading={isLoading}
                    rowKey="id"
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys) => {
                            setSelectedRowKeys(newSelectedRowKeys);
                        },
                    }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: pagination.total,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`,
                    }}
                    // className="custom-table"
                    scroll={{ x: 1000, y: 'calc(100vh - 350px)' }}
                    style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                />
            </div>
        </>
    );
};

export default HolidayList;