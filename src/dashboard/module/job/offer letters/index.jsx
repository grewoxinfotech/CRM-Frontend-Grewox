import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiCalendar
} from 'react-icons/fi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './offerLetters.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateOfferLetter from './CreateOfferLetter';
import OfferLetterList from './OfferLetterList';
import { Link } from 'react-router-dom';
import { useGetAllOfferLettersQuery, useDeleteOfferLetterMutation, useCreateOfferLetterMutation, useUpdateOfferLetterMutation } from './services/offerLetterApi';
import EditOfferLetter from './EditOfferLetter';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const OfferLetters = () => {
    const { data: offerLettersData, isLoading, refetch } = useGetAllOfferLettersQuery();
    const [deleteOfferLetter] = useDeleteOfferLetterMutation();
    const [createOfferLetter] = useCreateOfferLetterMutation();
    const [updateOfferLetter] = useUpdateOfferLetterMutation();
    const [offerLetters, setOfferLetters] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [filteredLetters, setFilteredLetters] = useState([]);
    const searchInputRef = useRef(null);

    const { data: jobs } = useGetAllJobsQuery();
    const { data: applicationsData } = useGetAllJobApplicationsQuery();

    const getJobTitle = (jobId) => {
        if (!jobs) return 'Loading...';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

    const applicationMap = React.useMemo(() => {
        if (!applicationsData?.data) return {};
        return applicationsData.data.reduce((acc, application) => {
            acc[application.id] = application.name || application.applicant_name;
            return acc;
        }, {});
    }, [applicationsData]);

    useEffect(() => {
        if (offerLettersData?.data) {
            console.log('Offer Letters Data:', offerLettersData.data);
            if (!searchText) {
                setFilteredLetters(offerLettersData.data);
                return;
            }

            const searchLower = searchText.toLowerCase();
            const filtered = offerLettersData.data.filter(letter => {
                // Search in job details
                const jobMatch = letter.job && getJobTitle(letter.job)?.toLowerCase().includes(searchLower);

                // Search in applicant details
                const applicantMatch = letter.job_applicant &&
                    applicationMap[letter.job_applicant]?.toLowerCase().includes(searchLower);

                // Search in other fields
                const otherFieldsMatch = (
                    letter.description?.toLowerCase().includes(searchLower) ||
                    letter.salary?.toString().includes(searchLower) ||
                    (letter.offer_expiry && moment(letter.offer_expiry).format('DD MMM YYYY').toLowerCase().includes(searchLower)) ||
                    (letter.expected_joining_date && moment(letter.expected_joining_date).format('DD MMM YYYY').toLowerCase().includes(searchLower))
                );

                return jobMatch || applicantMatch || otherFieldsMatch;
            });

            console.log('Filtered Letters:', filtered);
            setFilteredLetters(filtered);
        }
    }, [offerLettersData, searchText, applicationMap, jobs]);

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

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Offer Letters' : 'Delete Offer Letter';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected offer letters?`
            : 'Are you sure you want to delete this offer letter?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            icon: <ExclamationCircleOutlined />,
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteOfferLetter(id).unwrap()));
                        message.success(`${recordOrIds.length} offer letters deleted successfully`);
                    } else {
                        await deleteOfferLetter(recordOrIds.id).unwrap();
                        message.success('Offer letter deleted successfully');
                    }
                    refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete offer letter(s)');
                }
            },
        });
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
            setExportLoading(true);

            if (!offerLettersData?.data || offerLettersData.data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const data = offerLettersData.data.map(letter => ({
                'Job Title': getJobTitle(letter.job),
                'Applicant Name': applicationMap[letter.job_applicant] || 'N/A',
                'Position': letter.position || 'N/A',
                'Department': letter.department || 'N/A',
                'Salary': letter.salary ? `${letter.currency || ''} ${letter.salary}` : 'N/A',
                'Expected Joining Date': letter.expected_joining_date ? moment(letter.expected_joining_date).format('DD MMM YYYY') : 'N/A',
                'Offer Date': letter.offer_date ? moment(letter.offer_date).format('DD MMM YYYY') : 'N/A',
                'Offer Expiry': letter.offer_expiry ? moment(letter.offer_expiry).format('DD MMM YYYY') : 'N/A',
                'Status': letter.status || 'N/A',
                'Created Date': letter.created_at ? moment(letter.created_at).format('DD MMM YYYY') : 'N/A'
            }));

            const timestamp = moment().format('YYYY-MM-DD_HH-mm');
            const filename = `offer_letters_export_${timestamp}`;

            switch (type) {
                case 'csv':
                    exportToCSV(data, filename);
                    break;
                case 'excel':
                    exportToExcel(data, filename);
                    break;
                case 'pdf':
                    exportToPDF(data, filename);
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setExportLoading(false);
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

    const handleEditModalClose = () => {
        setIsFormVisible(false);
        setIsEditing(false);
        setSelectedLetter(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                await updateOfferLetter({
                    id: selectedLetter.id,
                    ...formData
                }).unwrap();
                message.success('Offer letter updated successfully');
            } else {
                await createOfferLetter(formData).unwrap();
                message.success('Offer letter created successfully');
            }
            setIsFormVisible(false);
            setSelectedLetter(null);
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error('Form submit error:', error);
            message.error(error?.data?.message || 'Failed to save offer letter');
        }
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
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Offer Letters</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Offer Letters</Title>
                    <Text type="secondary">Manage all offer letters in the organization</Text>
                </div>
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search offer letters..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            ref={searchInputRef}
                            className="search-input"
                            style={{ width: '300px' }}
                        />
                        <RangePicker
                            suffixIcon={<FiCalendar style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            onChange={(dates) => setDateRange(dates)}
                            value={dateRange}
                            allowClear
                            style={{ width: '300px', height: '40px' }}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown
                            overlay={exportMenu}
                            trigger={['click']}
                            disabled={isLoading || exportLoading}
                        >
                            <Button
                                className="export-button"
                                loading={exportLoading}
                            >
                                {!exportLoading && <FiDownload size={16} />}
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
                    onEdit={handleEditLetter}
                    onDelete={handleDelete}
                    loading={isLoading}
                    searchText={searchText}
                />
            </Card>

            {isFormVisible && (
                <CreateOfferLetter
                    open={isFormVisible}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleFormSubmit}
                    initialValues={selectedLetter}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default OfferLetters;
