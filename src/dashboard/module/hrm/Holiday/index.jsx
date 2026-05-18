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
import './holiday.scss';
import CreateHoliday from './CreateHoliday';
import EditHoliday from './EditHoliday';
import HolidayList from './HolidayList';
import { Link } from 'react-router-dom';
import { useGetAllHolidaysQuery } from './services/holidayApi';
import dayjs from 'dayjs';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../role/services/roleApi";

const Holiday = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { data: holidayData, isLoading } = useGetAllHolidaysQuery();

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
        const perms = userPermissions['extra-hrm-holiday'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const handleEdit = (record) => {
        const formattedRecord = {
            ...record,
            start_date: record.start_date ? dayjs(record.start_date) : null,
            end_date: record.end_date ? dayjs(record.end_date) : null
        };
        setSelectedHoliday(formattedRecord);
        setIsEditModalOpen(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="holiday-page standard-page-container">
            <PageHeader
                title="Holidays"
                count={holidayData?.data?.length || 0}
                subtitle="Manage all holidays in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Holiday" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search holidays..."
                onAdd={hasPermission('create') ? () => setIsCreateModalOpen(true) : undefined}
                addText="Add Holiday"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <HolidayList
                    onEdit={handleEdit}
                    searchText={searchText}
                    loading={isLoading}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateHoliday
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={() => { setIsCreateModalOpen(false); message.success('Holiday created successfully'); }}
            />

            <EditHoliday
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedHoliday(null);
                }}
                onSubmit={() => { setIsEditModalOpen(false); setSelectedHoliday(null); message.success('Holiday updated successfully'); }}
                initialValues={selectedHoliday}
            />
        </div>
    );
};

export default Holiday;