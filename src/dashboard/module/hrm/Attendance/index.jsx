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
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../role/services/roleApi";

const Attendance = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!loggedInUser) return false;
        if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['extra-hrm-attendance-attendancelist'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

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
                onAdd={hasPermission('create') ? () => setIsModalOpen(true) : undefined}
                addText="Create Attendance"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                    ]
                } : undefined}
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
