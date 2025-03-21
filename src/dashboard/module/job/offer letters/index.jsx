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
import './offerLetters.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateOfferLetter from './CreateOfferLetter';
import OfferLetterList from './OfferLetterList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const OfferLetters = () => {
    const [offerLetters, setOfferLetters] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredLetters, setFilteredLetters] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                job: 'Senior React Developer',
                job_application: 'John Doe',
                salary: '$100,000',
                expected_joining_date: new Date().toLocaleDateString(),
                offer_expiry: new Date().toLocaleDateString(),
                description: 'i am a senior react developer',
            }
        ];
        setOfferLetters(mockData);
        setFilteredLetters(mockData);
    }, []);

    useEffect(() => {
        let result = [...offerLetters];
        if (searchText) {
            result = result.filter(letter =>
                letter.candidate_name.toLowerCase().includes(searchText.toLowerCase()) ||
                letter.position.toLowerCase().includes(searchText.toLowerCase()) ||
                letter.department.toLowerCase().includes(searchText.toLowerCase()) ||
                letter.status.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredLetters(result);
    }, [offerLetters, searchText]);

    const handleAddLetter = () => {
        setSelectedLetter(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditLetter = (letter) => {
        setSelectedLetter(letter);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewLetter = (letter) => {
        setSelectedLetter(letter);
        // TODO: Implement view functionality
    };

    const handleDeleteConfirm = (letter) => {
        setSelectedLetter(letter);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteLetter = async () => {
        try {
            // TODO: Implement delete API call
            const updatedLetters = offerLetters.filter(l => l.id !== selectedLetter.id);
            setOfferLetters(updatedLetters);
            message.success('Offer letter deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete offer letter');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedLetters = offerLetters.map(l =>
                    l.id === selectedLetter.id ? { ...l, ...formData } : l
                );
                setOfferLetters(updatedLetters);
                message.success('Offer letter updated successfully');
            } else {
                const newLetter = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                setOfferLetters([...offerLetters, newLetter]);
                message.success('Offer letter created successfully');
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
            const data = offerLetters.map(letter => ({
                'Candidate Name': letter.candidate_name,
                'Position': letter.position,
                'Department': letter.department,
                'Salary': letter.salary,
                'Joining Date': letter.joining_date,
                'Offer Date': letter.offer_date,
                'Expiry Date': letter.expiry_date,
                'Status': letter.status,
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'offer_letters_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'offer_letters_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'offer_letters_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Offer Letters');
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
        <div className="offer-letters-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/job">Job</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Offer Letters</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Offer Letters</Title>
                    <Text type="secondary">Manage all offer letters</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search offer letters..."
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
                            onClick={handleAddLetter}
                            className="add-button"
                        >
                            Add Offer Letter
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="offer-letters-table-card">
                <OfferLetterList
                    offerLetters={filteredLetters}
                    loading={loading}
                    onEdit={handleEditLetter}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewLetter}
                />
            </Card>

            <CreateOfferLetter
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedLetter}
                loading={loading}
            />

            <Modal
                title="Delete Offer Letter"
                open={isDeleteModalVisible}
                onOk={handleDeleteLetter}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete offer letter for <strong>{selectedLetter?.candidate_name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default OfferLetters;
