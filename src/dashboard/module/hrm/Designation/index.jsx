import React, { useState } from 'react';
import { Card, message } from 'antd';
import { FiPlus, FiHome, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreateDesignation from './CreateDesignation';
import DesignationList from './DesignationList';
import './designation.scss';
import { useGetAllDesignationsQuery } from './services/designationApi';
import PageHeader from '../../../../components/PageHeader';

const Designation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { data: designationData, isLoading } = useGetAllDesignationsQuery();

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="designation-page standard-page-container">
            <PageHeader
                title="Designations"
                count={designationData?.message?.data?.length || 0}
                subtitle="Manage all designations in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Designation" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search designations..."
                onAdd={() => { setIsEditing(false); setSelectedDesignation(null); setIsModalOpen(true); }}
                addText="Add Designation"
                exportMenu={{
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <DesignationList
                    onEdit={(record) => { setSelectedDesignation(record); setIsEditing(true); setIsModalOpen(true); }}
                    searchText={searchText}
                    loading={isLoading}
                />
            </Card>

            <CreateDesignation
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedDesignation(null);
                    setIsEditing(false);
                }}
                onSubmit={() => { setIsModalOpen(false); setSelectedDesignation(null); setIsEditing(false); }}
                isEditing={isEditing}
                initialValues={selectedDesignation}
            />
        </div>
    );
};

export default Designation;
