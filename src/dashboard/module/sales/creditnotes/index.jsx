import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Breadcrumb
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome,
    FiChevronDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreateCreditNotes from './CreateCreditNotes';
import CreditNotesList from './CreditNotesList';
import EditCreditNotes from './EditCreditNotes';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const { Title, Text } = Typography;

const CreditNotes = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCreditNote, setSelectedCreditNote] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    // Dummy data for demonstration
    const creditNotesData = [
        {
            id: 1,
            amount: 500.00,
            account: "CN-2023-001",
            date: "2023-12-01",
            customer: "John Doe",
            category: "Sales Return",
            description: "Defective product return",
            status: "Issued",
          
        },
        // Add more dummy data as needed
    ];

    const handleCreate = () => {
        setSelectedCreditNote(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedCreditNote(record);
        setIsEditModalOpen(true);
    };

    const handleView = (record) => {
        console.log('View credit note:', record);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#faad14', fontSize: '22px' }}>⚠</span>
                    Delete Credit Note
                </div>
            ),
            content: 'Are you sure you want to delete this credit note?',
            okText: 'Yes',
            cancelText: 'No',
            centered: true,
            className: 'custom-delete-modal',
            icon: null,
            maskClosable: true,
            okButtonProps: {
                danger: true,
                size: 'middle'
            },
            cancelButtonProps: {
                size: 'middle'
            },
            onOk: () => {
                message.success('Credit note deleted successfully');
            }
        });
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = creditNotesData.map(note => ({
                'Credit Note #': note.account,
                'Amount': note.amount,
                'Date': note.date,
                'Customer': note.customer,
                'Invoice Reference': note.invoiceReference,
                'Reason': note.reason,
                'Status': note.status,
                'Description': note.description
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'credit_notes_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'credit_notes_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'credit_notes_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Credit Notes');
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

  return (
        <div className="customer-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/sales">Sales</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Credit Notes</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Credit Notes</Title>
                    <Text type="secondary">Manage all credit notes in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search credit notes..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ width: 300 }}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                className="export-button"
                                icon={<FiDownload size={16} />}
                                loading={loading}
                            >
                                Export
                                <FiChevronDown size={16} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleCreate}
                            className="add-button"
                        >
                            Add Credit Note
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="customer-table-card">
                <CreditNotesList
                    creditNotes={creditNotesData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchText={searchText}
                />
            </Card>

            <CreateCreditNotes
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={() => {
                    setIsCreateModalOpen(false);
                    message.success('Credit note created successfully');
                }}
            />

            <EditCreditNotes
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedCreditNote(null);
                }}
                onSubmit={() => {
                    setIsEditModalOpen(false);
                    setSelectedCreditNote(null);
                    message.success('Credit note updated successfully');
                }}
                initialValues={selectedCreditNote}
            />
        </div>
    );
};

export default CreditNotes;
