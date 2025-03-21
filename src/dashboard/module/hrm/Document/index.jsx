import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Row,
    Col,
    Breadcrumb,
    Space
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './document.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateDocument from './CreateDocument';
import DocumentList from './DocumentList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Document = () => {
    const [documents, setDocuments] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        handleSearch(searchText);
    }, [documents, searchText]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const mockData = [
                {
                    id: 1,
                    name: 'Employee Handbook',
                    role: 'Employee',
                    description: 'Employee Handbook',
                    created_by: 'Admin',
                    status: 'active'
                }
            ];
            setDocuments(mockData);
        } catch (error) {
            message.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        let result = [...documents];
        if (value) {
            result = result.filter(document => {
                const categoryMatch = document.category?.toLowerCase().includes(value.toLowerCase());
                const titleMatch = document.documentItems?.some(item => 
                    item.title?.toLowerCase().includes(value.toLowerCase())
                );
                return categoryMatch || titleMatch;
            });
        }
        setFilteredDocuments(result);
    };

    const handleAddDocument = () => {
        setSelectedDocument(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditDocument = (document) => {
        setSelectedDocument(document);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (document) => {
        setSelectedDocument(document);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteDocument = async () => {
        try {
            setLoading(true);
            // TODO: Implement delete API call
            const updatedDocuments = documents.filter(d => d.id !== selectedDocument.id);
            setDocuments(updatedDocuments);
            message.success('Document deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete document');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            if (isEditing) {
                // TODO: Implement update API call
                const updatedDocuments = documents.map(d =>
                    d.id === selectedDocument.id ? { ...d, ...formData } : d
                );
                setDocuments(updatedDocuments);
                message.success('Document updated successfully');
            } else {
                // TODO: Implement create API call
                const newDocument = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    created_by: 'Admin',
                    status: 'active'
                };
                setDocuments([...documents, newDocument]);
                message.success('Document created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Documents');
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

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = documents.map(document => ({
                'Category': document.category,
                'Document Items': document.documentItems.map(item => item.title).join(', '),
                'Status': document.status,
                'Created By': document.created_by,
                'Created Date': moment(document.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'documents_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'documents_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'documents_export');
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

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

  return (
        <div className="document-page">
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
                    <Breadcrumb.Item>Documents</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Documents</Title>
                    <Text type="secondary">Manage all documents in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search documents..."
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
                            onClick={handleAddDocument}
                            className="add-button"
                        >
                            Add Document
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="document-table-card">
                <DocumentList
                    documents={filteredDocuments}
                    loading={loading}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteConfirm}
                />
            </Card>

            <CreateDocument
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedDocument}
                loading={loading}
            />

            <Modal
                title="Delete Document"
                open={isDeleteModalVisible}
                onOk={handleDeleteDocument}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete this document?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Document;