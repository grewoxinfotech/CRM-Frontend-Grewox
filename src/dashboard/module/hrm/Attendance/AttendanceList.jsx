import React, { useState } from 'react';
import { Table, Tag, Tooltip, DatePicker, Typography, Space } from 'antd';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useGetAllAttendancesQuery } from './services/attendanceApi';
import { useGetEmployeesQuery } from '../Employee/services/employeeApi';
import { useGetAllHolidaysQuery } from '../Holiday/services/holidayApi';
import { useGetLeaveQuery } from '../leave/services/leaveApi';
import dayjs from 'dayjs';
import './attendance.scss';

const { Text } = Typography;

const AttendanceList = ({ searchText }) => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    
    const { data: attendanceData, isLoading: isLoadingAttendance } = useGetAllAttendancesQuery();
    const { data: employeeData } = useGetEmployeesQuery();
    const { data: holidayData } = useGetAllHolidaysQuery();
    const { data: leaveData } = useGetLeaveQuery();

    const calculateDuration = (startTimeStr, endTimeStr) => {
        try {
            if (!endTimeStr) return 'In Progress';
            const startTime = dayjs(startTimeStr, 'HH:mm:ss');
            const endTime = dayjs(endTimeStr, 'HH:mm:ss');
            if (startTime.isValid() && endTime.isValid()) {
                const diffMinutes = endTime.diff(startTime, 'minute');
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return `${hours}h ${minutes}m`;
            }
        } catch (e) {}
        return 'N/A';
    };

    const days = React.useMemo(() => {
        const d = [];
        const daysInMonth = selectedMonth.daysInMonth();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = selectedMonth.date(i);
            d.push({
                date: i,
                day: dayDate.format('ddd'),
                fullDate: dayDate.format('YYYY-MM-DD'),
            });
        }
        return d;
    }, [selectedMonth]);

    const statusConfig = {
        'P': { color: '#059669', text: 'Present', bg: '#ecfdf5' },
        'A': { color: '#dc2626', text: 'Absent', bg: '#fef2f2' },
        'L': { color: '#d97706', text: 'Leave', bg: '#fffbeb' },
        'H': { color: '#0284c7', text: 'Half Day', bg: '#f0f9ff' },
        'WK': { color: '#4b5563', text: 'Weekend', bg: '#f3f4f6' }
    };

    const data = React.useMemo(() => {
        const employees = employeeData?.data || [];
        const attendances = attendanceData?.data || [];
        const holidayList = holidayData?.data || [];
        const leaveList = leaveData?.data || [];

        return employees.filter(emp => {
            if (!searchText) return true;
            const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            return name.includes(searchText.toLowerCase());
        }).map(emp => {
            const row = { key: emp.id, name: `${emp.firstName} ${emp.lastName}`, code: emp.employee_code };
            days.forEach(day => {
                const att = attendances.find(a => a.employee === emp.id && dayjs(a.date).format('YYYY-MM-DD') === day.fullDate);
                const isWeekend = ['Sat', 'Sun'].includes(day.day);
                const leave = leaveList.find(l => l.employeeId === emp.id && l.status === 'approved' && (dayjs(day.fullDate).isSame(l.startDate, 'day') || dayjs(day.fullDate).isBetween(l.startDate, l.endDate, 'day', '[]')));

                if (leave) row[`day${day.date}`] = leave.isHalfDay ? 'H' : 'L';
                else if (isWeekend) row[`day${day.date}`] = 'WK';
                else if (att) row[`day${day.date}`] = att.halfDay ? 'H' : 'P';
                else row[`day${day.date}`] = 'A';
            });
            return row;
        });
    }, [employeeData, attendanceData, holidayData, leaveData, days, searchText]);

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 180,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                        <FiUser size={12} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '12px' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '10px' }}>{record.code}</Text>
                    </div>
                </div>
            )
        },
        ...days.map(day => ({
            title: <div style={{ fontSize: '10px', lineHeight: '1.2' }}><div>{day.date}</div><div style={{ fontWeight: 400 }}>{day.day}</div></div>,
            dataIndex: `day${day.date}`,
            key: `day${day.date}`,
            width: 45,
            align: 'center',
            render: (status) => {
                const config = statusConfig[status] || statusConfig['A'];
                return (
                    <Tooltip title={config.text}>
                        <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '4px', 
                            background: config.bg, 
                            color: config.color, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '10px', 
                            fontWeight: 600,
                            margin: '0 auto'
                        }}>
                            {status}
                        </div>
                    </Tooltip>
                );
            }
        }))
    ];

    return (
        <div className="attendance-list-container">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <DatePicker 
                    picker="month" 
                    value={selectedMonth} 
                    onChange={setSelectedMonth} 
                    allowClear={false} 
                    size="small"
                    style={{ borderRadius: '6px' }}
                />
                <Space size={8}>
                    {Object.entries(statusConfig).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: value.bg }}></div>
                            <Text type="secondary">{value.text}</Text>
                        </div>
                    ))}
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                scroll={{ x: 'max-content' }}
                pagination={false}
                size="small"
                className="compact-table"
                bordered
            />
        </div>
    );
};

export default AttendanceList;
