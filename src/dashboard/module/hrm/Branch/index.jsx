import React, { useState } from 'react';
import {
    Card, message,
} from 'antd';
import {
    FiPlus, FiDownload,
    FiHome,
} from 'react-icons/fi';
import './branch.scss';
import CreateBranch from './CreateBranch';
import BranchList from './BranchList';
import { Link } from 'react-router-dom';
import { useGetAllBranchesQuery } from './services/branchApi';
import PageHeader from '../../../../components/PageHeader';

const Branch = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters] = useState({
        dateRange: [],
        status: undefined,
        designationType: undefined
    });

    const { data: branchData, isLoading } = useGetAllBranchesQuery();

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="branch-page standard-page-container">
            <PageHeader
                title="Branches"
                count={branchData?.data?.length || 0}
                subtitle="Manage all branches in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Branch" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search branches..."
                onAdd={() => { setIsEditing(false); setSelectedBranch(null); setIsModalOpen(true); }}
                addText="Add Branch"
                exportMenu={{
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <BranchList
                    onEdit={(record) => { setSelectedBranch(record); setIsEditing(true); setIsModalOpen(true); }}
                    searchText={searchText}
                    filters={filters}
                    loading={isLoading}
                />
            </Card>

            <CreateBranch
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedBranch(null);
                    setIsEditing(false);
                }}
                onSubmit={() => { setIsModalOpen(false); setSelectedBranch(null); setIsEditing(false); }}
                isEditing={isEditing}
                initialValues={selectedBranch}
            />
        </div>
    );
};

export default Branch;
