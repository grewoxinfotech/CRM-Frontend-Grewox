import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './training.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateTraining from './CreateTraining';
import TrainingList from './TrainingList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Training = () => {
    const [trainings, setTrainings] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredTrainings, setFilteredTrainings] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                title: 'Web Development Training',
                category: 'Technical',
                link: 'https://www.google.com',
                created_at: new Date().toISOString(),
                created_by: 'Admin'
            }
        ];
        setTrainings(mockData);
    }, []);

    useEffect(() => {
        let result = [...trainings];
        if (searchText) {
            result = result.filter(training =>
                training.title.toLowerCase().includes(searchText.toLowerCase()) ||
                training.type.toLowerCase().includes(searchText.toLowerCase()) ||
                training.trainer.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredTrainings(result);
    }, [trainings, searchText]);

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

    const handleDeleteConfirm = (training) => {
        setSelectedTraining(training);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteTraining = async () => {
        try {
            // TODO: Implement delete API call
            const updatedTrainings = trainings.filter(t => t.id !== selectedTraining.id);
            setTrainings(updatedTrainings);
            message.success('Training deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete training');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedTrainings = trainings.map(t =>
                    t.id === selectedTraining.id ? { ...t, ...formData } : t
                );
                setTrainings(updatedTrainings);
                message.success('Training updated successfully');
            } else {
                const newTraining = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    status: 'active'
                };
                setTrainings([...trainings, newTraining]);
                message.success('Training created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = trainings.map(training => ({
                'Title': training.title,
                'Type': training.type,
                'Trainer': training.trainer,
                'Start Date': moment(training.start_date).format('YYYY-MM-DD'),
                'End Date': moment(training.end_date).format('YYYY-MM-DD'),
                'Status': training.status,
                'Created Date': moment(training.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'trainings_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'trainings_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'trainings_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Trainings');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

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
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Training</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Trainings</Title>
                    <Text type="secondary">Manage all trainings in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search trainings..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        ref={searchInputRef}
                        className="search-input"
                    />
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button">
                                <FiDownload size={16} />
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddTraining}
                            className="add-button"
                        >
                            Add Training
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="training-table-card">
                <TrainingList
                    trainings={filteredTrainings}
                    loading={loading}
                    onEdit={handleEditTraining}
                    onDelete={handleDeleteConfirm}
                />
            </Card>

            <CreateTraining
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedTraining}
                loading={loading}
            />

            <Modal
                title="Delete Training"
                open={isDeleteModalVisible}
                onOk={handleDeleteTraining}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedTraining?.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Training;
