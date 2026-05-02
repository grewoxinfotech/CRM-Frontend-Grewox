import React, { useState } from 'react';
import {
    Card,
    message,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './attendance.scss';
import CreateAttendance from './CreateAttendance';
import AttendanceList from './AttendanceList';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../../../components/PageHeader';

const Attendance = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="attendance-page standard-page-container">
            <PageHeader
                title="Attendance"
                subtitle="Manage employee attendance records"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Attendance" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search employee..."
                onAdd={() => setIsModalOpen(true)}
                addText="Create Attendance"
                exportMenu={{
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <AttendanceList
                    searchText={searchText}
                    selectedMonth={selectedMonth}
                />
            </Card>

            <CreateAttendance
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={() => { setIsModalOpen(false); message.success('Attendance created successfully'); }}
            />
        </div>
    );
};

export default Attendance;
