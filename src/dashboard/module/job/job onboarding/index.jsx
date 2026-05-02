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
                onAdd={handleAddOnboarding}
                addText="Add Onboarding"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
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
