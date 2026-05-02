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
import './jobApplications.scss';
import CreateJobApplication from './CreateJobApplication';
import JobApplicationList from './JobApplicationList';
import { Link } from 'react-router-dom';
import { useGetAllJobApplicationsQuery, useDeleteJobApplicationMutation } from './services/jobApplicationApi';
import PageHeader from '../../../../components/PageHeader';

const JobApplications = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: applications, isLoading } = useGetAllJobApplicationsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText
    });

    const [deleteApplication] = useDeleteJobApplicationMutation();

    const handleAddApplication = () => {
        setSelectedApplication(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditApplication = (application) => {
        setSelectedApplication(application);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="job-applications-page standard-page-container">
            <PageHeader
                title="Job Applications"
                count={applications?.total || 0}
                subtitle="Manage all job applications"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Job" },
                    { title: "Applications" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search applications..."
                onAdd={handleAddApplication}
                addText="Add Application"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <JobApplicationList
                    applications={applications?.data || []}
                    loading={isLoading}
                    onEdit={handleEditApplication}
                    onDelete={async (id) => {
                        try {
                            await deleteApplication(id).unwrap();
                            message.success('Application deleted successfully');
                        } catch (e) {
                            message.error('Failed to delete application');
                        }
                    }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: applications?.total || 0,
                        onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
                    }}
                />
            </Card>

            <CreateJobApplication
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                isEditing={isEditing}
                initialValues={selectedApplication}
            />
        </div>
    );
};

export default JobApplications;
