import React, { useState, useRef } from 'react';
import {
    Typography, Button, Modal, message,
    Input, Dropdown, Menu, Breadcrumb,
    Card, Row, Col, Space, Popover
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './training.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import CreateTraining from './CreateTraining';
import TrainingList from './TrainingList';
import ViewTraining from './ViewTraining';
import { Link } from 'react-router-dom';
import { useGetTrainingsQuery, useDeleteTrainingMutation } from './services/trainingApi';

const { Title, Text } = Typography;

const Training = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isViewTrainingVisible, setIsViewTrainingVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const searchInputRef = useRef(null);
    const [deleteTraining, { isLoading: isDeleting }] = useDeleteTrainingMutation();

    const { data: response, isLoading } = useGetTrainingsQuery({
        page: currentPage,
        pageSize,
        search: searchText
    });

    const trainings = response?.data || [];
    const pagination = response?.pagination || {
        total: 0,
        current: 1,
        pageSize: 10,
        totalPages: 0
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleAddTraining = () => {
        setSelectedTraining(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

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

    const handleFormSubmit = async (formData) => {
        try {
            message.success(isEditing ? "Training updated successfully" : "Training created successfully");
            setIsFormVisible(false);
        } catch (error) {
            message.error("Operation failed");
        }
    };

    const handleExport = async (type) => {
        try {
            if (!trainings.length) {
                message.warning('No data available to export');
                return;
            }

            const formattedData = trainings.map(training => ({
                'Title': training.title || '-',
                'Category': training.category || '-',
                'Links': training.links || '-',
                'Created By': training.created_by || '-',
                'Created Date': training.createdAt ? moment(training.createdAt).format('DD-MM-YYYY') : '-',
                'Status': training.status || '-'
            }));

            const fileName = `trainings_${moment().format('DD-MM-YYYY')}`;

            switch (type) {
                case 'csv':
                    const csvContent = [
                        Object.keys(formattedData[0]).join(','),
                        ...formattedData.map(item =>
                            Object.values(item)
                                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                                .join(',')
                        )
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${fileName}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    message.success('Successfully exported as CSV');
                    break;

                case 'excel':
                    const ws = XLSX.utils.json_to_sheet(formattedData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Trainings');
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                    message.success('Successfully exported as Excel');
                    break;

                default:
                    message.error('Unsupported export type');
            }
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export data');
        }
    };

    const searchContent = (
        <div className="search-content">
            <Input
                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                placeholder="Search trainings..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                ref={searchInputRef}
                className="search-input"
            />
        </div>
    );

    return (
        <div className="training-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    {/* <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item> */}
                    <Breadcrumb.Item>Training</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Trainings</Title>
                    <Text className="page-description" type="secondary">Manage all trainings in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="desktop-actions">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="search-container">
                                <Input
                                    prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                                    placeholder="Search trainings..."
                                    allowClear
                                    onChange={(e) => handleSearch(e.target.value)}
                                    value={searchText}
                                    ref={searchInputRef}
                                    className="search-input"
                                />
                                <Popover
                                    content={searchContent}
                                    trigger="click"
                                    open={isSearchVisible}
                                    onOpenChange={setIsSearchVisible}
                                    placement="bottomRight"
                                    className="mobile-search-popover"
                                >
                                    <Button
                                        className="search-icon-button"
                                        icon={<FiSearch size={16} />}
                                    />
                                </Popover>
                            </div>
                            <Dropdown overlay={
                                <Menu>
                                    <Menu.Item key="csv" onClick={() => handleExport('csv')}>
                                        Export as CSV
                                    </Menu.Item>
                                    <Menu.Item key="excel" onClick={() => handleExport('excel')}>
                                        Export as Excel
                                    </Menu.Item>
                                </Menu>
                            } trigger={['click']}>
                                <Button className="export-button">
                                    <FiDownload size={16} />
                                    <span className="button-text">Export</span>
                                </Button>
                            </Dropdown>
                            <Button
                                type="primary"
                                icon={<FiPlus size={16} />}
                                onClick={handleAddTraining}
                                className="add-button"
                            >
                                <span className="button-text">Create Training</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="training-table-card">
                <TrainingList
                    loading={isLoading}
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
                onSubmit={handleFormSubmit}
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
