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
import './jobOnboarding.scss';
import CreateJobOnboarding from './CreateJobOnboarding';
import JobOnboardingList from './JobOnboardingList';
import { Link } from 'react-router-dom';
import { useGetAllJobOnboardingQuery, useDeleteJobOnboardingMutation } from './services/jobOnboardingApi';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const JobOnboarding = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: onboardingsData, isLoading, refetch } = useGetAllJobOnboardingQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
    });

    const [deleteOnboarding] = useDeleteJobOnboardingMutation();

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
        const perms = userPermissions['extra-hrm-jobs-jobonbording'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const handleAddOnboarding = () => {
        setSelectedOnboarding(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditOnboarding = (onboarding) => {
        setSelectedOnboarding(onboarding);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    const { data: currenciesData } = useGetAllCurrenciesQuery();

    return (
        <div className="job-onboarding-page standard-page-container">
            <PageHeader
                title="Job Onboarding"
                count={onboardingsData?.pagination?.total || 0}
                subtitle="Manage employee onboarding process"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Job" },
                    { title: "Onboarding" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search onboardings..."
                onAdd={hasPermission('create') ? handleAddOnboarding : undefined}
                addText="Add Onboarding"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <JobOnboardingList
                    onboardings={onboardingsData?.data || []}
                    onEdit={handleEditOnboarding}
                    onDelete={async (id) => {
                        try {
                            await deleteOnboarding(id).unwrap();
                            message.success('Onboarding deleted successfully');
                            refetch();
                        } catch (e) {
                            message.error('Failed to delete onboarding');
                        }
                    }}
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: onboardingsData?.pagination?.total || 0,
                        onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
                    }}
                    hasPermission={hasPermission}
                    currenciesData={currenciesData}
                />
            </Card>

            <CreateJobOnboarding
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={() => { setIsFormVisible(false); refetch(); }}
                isEditing={isEditing}
                initialValues={selectedOnboarding}
            />
        </div>
    );
};

export default JobOnboarding;
