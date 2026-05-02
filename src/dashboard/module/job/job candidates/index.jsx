import React, { useState } from 'react';
import {
    Card,
    message,
} from 'antd';
import {
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import '../job applications/jobApplications.scss';
import { Link } from 'react-router-dom';
import { useGetAllJobApplicationsQuery, useDeleteJobApplicationMutation } from '../job applications/services/jobApplicationApi';
import JobCandidateList from '../job candidates/JobCandidateList';
import PageHeader from '../../../../components/PageHeader';

const JobCandidates = () => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: applications, isLoading } = useGetAllJobApplicationsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
    });

    const [deleteApplication] = useDeleteJobApplicationMutation();

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="job-candidates-page standard-page-container">
            <PageHeader
                title="Job Candidates"
                count={applications?.total || 0}
                subtitle="Manage all job candidates"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Job" },
                    { title: "Candidates" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search candidates..."
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <JobCandidateList
                    applications={applications?.data || []}
                    loading={isLoading}
                    onEdit={(record) => message.info('Edit functionality')}
                    onDelete={async (id) => {
                        try {
                            await deleteApplication(id).unwrap();
                            message.success('Candidate deleted successfully');
                        } catch (e) {
                            message.error('Failed to delete candidate');
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
        </div>
    );
};

export default JobCandidates;
