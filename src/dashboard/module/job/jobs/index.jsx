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
import './job.scss';
import CreateJob from './CreateJob';
import JobList from './JobList';
import { Link } from 'react-router-dom';
import { useGetAllJobsQuery, useDeleteJobMutation } from './services/jobApi';
import PageHeader from '../../../../components/PageHeader';

const Job = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: jobsData, isLoading, refetch } = useGetAllJobsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
    });
    const [deleteJob] = useDeleteJobMutation();

    const handleAddJob = () => {
        setSelectedJob(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="job-page standard-page-container">
            <PageHeader
                title="Jobs"
                count={jobsData?.total || 0}
                subtitle="Manage all jobs in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Jobs" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search jobs..."
                onAdd={handleAddJob}
                addText="Add Job"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <JobList
                    jobs={jobsData?.data || []}
                    onEdit={handleEditJob}
                    onDelete={async (id) => {
                        try {
                            await deleteJob(id).unwrap();
                            message.success('Job deleted successfully');
                            refetch();
                        } catch (e) {
                            message.error('Failed to delete job');
                        }
                    }}
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: jobsData?.total || 0,
                        onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
                    }}
                />
            </Card>

            {isFormVisible && (
                <CreateJob
                    open={isFormVisible}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={() => { setIsFormVisible(false); refetch(); }}
                    initialValues={selectedJob}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default Job;
