import React, { useState } from 'react';
import { message, Space, Button, Dropdown, Menu } from 'antd';
import { FiPlus, FiDownload, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './training.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import CreateTraining from './CreateTraining';
import TrainingList from './TrainingList';
import ViewTraining from './ViewTraining';
import { useGetTrainingsQuery, useDeleteTrainingMutation } from './services/trainingApi';
import PageHeader from '../../../../components/PageHeader';

const Training = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isViewTrainingVisible, setIsViewTrainingVisible] = useState(false);

    const [deleteTraining, { isLoading: isDeleting }] = useDeleteTrainingMutation();

    const { data: response, isLoading } = useGetTrainingsQuery({
        page: currentPage,
        pageSize,
        search: searchText
    });

    const trainings = response?.data || [];
    const pagination = response?.pagination || { total: 0, current: 1, pageSize: 10 };

    const handleEditTraining = (training) => {
        setSelectedTraining(training);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewTraining = (training) => {
        setSelectedTraining(training);
        setIsViewTrainingVisible(true);
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteTraining(id).unwrap();
            message.success("Training deleted successfully");
        } catch (error) {
            message.error(error.data?.message || "Failed to delete training");
        }
    };

    const handleExport = (type) => {
        const formattedData = trainings.map(training => ({
            'Title': training.title || '-',
            'Category': training.category || '-',
            'Links': training.links || '-',
            'Created By': training.created_by || '-',
            'Created Date': training.createdAt ? moment(training.createdAt).format('DD-MM-YYYY') : '-',
            'Status': training.status || '-'
        }));
        if (type === 'excel') {
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Trainings');
            XLSX.writeFile(wb, `trainings_${moment().format('DD-MM-YYYY')}.xlsx`);
        }
        message.success(`Successfully exported as ${type.toUpperCase()}`);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="excel" onClick={() => handleExport('excel')}>Excel</Menu.Item>
        </Menu>
    );

    return (
        <div className="training-page standard-page-container">
            <PageHeader
                title="Trainings"
                subtitle="Manage all trainings in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Training" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                onAdd={() => { setSelectedTraining(null); setIsEditing(false); setIsFormVisible(true); }}
                addText="Create Training"
                extraActions={[
                    <Dropdown key="export" overlay={exportMenu} trigger={['click']}>
                        <Button icon={<FiDownload />}>Export</Button>
                    </Dropdown>
                ]}
            />

            <div className="standard-content-card" style={{ marginTop: '12px' }}>
                <TrainingList
                    loading={isLoading || isDeleting}
                    trainings={trainings}
                    pagination={pagination}
                    onEdit={handleEditTraining}
                    onView={handleViewTraining}
                    onDelete={handleDeleteConfirm}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            <CreateTraining
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={() => setIsFormVisible(false)}
                initialValues={selectedTraining}
                isEditing={isEditing}
            />

            <ViewTraining
                visible={isViewTrainingVisible}
                onCancel={() => setIsViewTrainingVisible(false)}
                training={selectedTraining}
            />
        </div>
    );
};

export default Training;
